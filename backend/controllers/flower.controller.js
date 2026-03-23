import pool from "../config/db.js";
import fs from 'fs/promises';
import path from 'path';

export const createFlower = async (req, res) => {
   const client = await pool.connect();

   try {
      await client.query('BEGIN');

      const { title, description, palette_id, packaging_id, is_new, is_sale } = req.body;
      const compositions = req.body.compositions;
      const selected_species = JSON.parse(req.body.selected_species || '[]');
      const variants = JSON.parse(req.body.variants || '[]');

      // Собираем пути к файлам
      const imageUrls = req.files.map(file => `/uploads/flowers/${file.filename}`);

      // 1. Вставка основного букета
      const flowerRes = await client.query(
         `
         INSERT INTO "Flowers" (title, description, composition, palette_id, packaging_id, is_new, is_sale, images) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING flower_id`,
         [
            title,
            description,
            compositions,
            palette_id ? parseInt(palette_id) : null,
            packaging_id ? parseInt(packaging_id) : null,
            is_new === 'true',
            is_sale === 'true',
            JSON.stringify(imageUrls)
         ]
      );

      const flowerId = flowerRes.rows[0].flower_id;

      // 2. Вставка вариантов цен (параллельно через Promise.all)
      if (variants.length > 0) {
         const variantPromises = variants.map(v =>
            client.query(
               `
               INSERT INTO "Flower_Variants" (flower_id, size_name, price_old, price_new, is_default) 
               VALUES ($1, $2, $3, $4, $5)
               `,
               [flowerId, v.size_name, v.price_old || null, v.price_new, v.is_default]
            )
         );
         await Promise.all(variantPromises);
      }

      // 3. Вставка состава (связующая таблица)
      if (selected_species.length > 0) {
         const speciesPromises = selected_species.map(speciesId =>
            client.query(
               `INSERT INTO "Flower_To_Species" (flower_id, species_id) VALUES ($1, $2)`,
               [flowerId, speciesId]
            )
         );
         await Promise.all(speciesPromises);
      }

      await client.query('COMMIT');
      res.status(201).json({ success: true, flowerId });
   } catch (error) {
      await client.query('ROLLBACK');
      console.error('Ошибка создания букета:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
   } finally {
      client.release();
   }
};

// Получаем цветы
export const getFlowers = async (req, res) => {
   const { page = 1, limit = 8, search = '' } = req.params;
   const offset = (page - 1) * limit;

   // Подготовка поискового паттерна для SQL (например, "%роза%")
   const searchPattern = `%${search}%`;

   try {
      // 1. Считаем общее количество с учетом поиска
      const countRes = await pool.query(
         'SELECT COUNT(*) FROM "Flowers" WHERE title ILIKE $1',
         [searchPattern]
      );

      const totalItems = parseInt(countRes.rows[0].count);
      const totalPages = Math.ceil(totalItems / limit);

      // 2. Получаем данные с фильтрацией ILIKE
      const dataRes = await pool.query(`
         SELECT f.*, MIN(fv.price_new) as min_price, p.name as packaging_name
         FROM "Flowers" f
         LEFT JOIN "Flower_Variants" fv ON f.flower_id = fv.flower_id
         LEFT JOIN "Packaging_Types" p ON f.packaging_id = p.packaging_id
         WHERE f.title ILIKE $1
         GROUP BY f.flower_id, p.name
         ORDER BY f.created_at DESC
         LIMIT $2 OFFSET $3
    `, [searchPattern, limit, offset]);

      res.json({
         data: dataRes.rows,
         totalPages,
         currentPage: parseInt(page)
      });
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ошибка сервера' });
   }
};

// Удаляем букет
export const deleteFlower = async (req, res) => {
   const { id } = req.params;

   try {
      // 1. Сначала найдем букет, чтобы получить пути к его картинкам
      const flowerRes = await pool.query('SELECT images FROM "Flowers" WHERE flower_id = $1', [id]);
      
      if (flowerRes.rowCount === 0) {
         return res.status(404).json({ message: 'Букет не найден', success: false });
      }

      const imageData = flowerRes.rows[0].images; // Это твоя строка JSON или массив

      // 2. Начинаем транзакцию удаления в БД
      await pool.query('BEGIN');
      await pool.query('DELETE FROM "Flower_Variants" WHERE flower_id = $1', [id]);
      await pool.query('DELETE FROM "Flowers" WHERE flower_id = $1', [id]);
      await pool.query('COMMIT');

      // 3. Если в базе всё удалено успешно — чистим файлы
      let images = [];
      try {
         images = typeof imageData === 'string' ? JSON.parse(imageData) : imageData;
      } catch (e) {
         images = [];
      }

      // Проходим по массиву путей и удаляем каждый файл
      if (Array.isArray(images)) {
         for (const imgPath of images) {
            // Формируем полный путь к файлу (убедись, что путь корректный относительно корня проекта)
            const fullPath = path.join(process.cwd(), imgPath); 
            
            try {
               await fs.unlink(fullPath);
               console.log(`Файл удален: ${fullPath}`);
            } catch (err) {
               // Если файла нет на диске (например, удалили вручную), просто логируем, чтобы не прерывать процесс
               console.error(`Не удалось удалить файл: ${fullPath}`, err.message);
            }
         }
      }

      return res.status(200).json({
         message: 'Букет и файлы успешно удалены',
         success: true
      });

   } catch (error) {
      await pool.query('ROLLBACK');
      console.error("Ошибка удаления:", error);
      return res.status(500).json({ message: 'Ошибка сервера', success: false });
   }
};