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
   const { page = 1, limit = 8, search = '' } = req.query;
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

export const getFlowersCategory = async (req, res) => {
   const {
      page = 1,
      limit = 6,
      search = '',
      species = '',
      packaging = '',
      palettes = '',
      price = ''
   } = req.query;

   const offset = (page - 1) * limit;
   const searchTrimmed = search ? search.trim() : '';

   // 1. ПРАВИЛЬНЫЙ ПАРСИНГ ЦЕНЫ
   // Используем null, если фильтр не активен, чтобы SQL это понял
   let minPrice = null;
   let maxPrice = null;

   if (price && price.includes('-')) {
      const [min, max] = price.split('-').map(Number);
      minPrice = !isNaN(min) ? min : 0;
      maxPrice = (max && max !== 0) ? max : 9999999;
   }

   const speciesIds = species ? species.split(',').map(Number).filter(n => !isNaN(n)) : [];
   const packagingIds = packaging ? packaging.split(',').map(Number).filter(n => !isNaN(n)) : [];
   const paletteIds = palettes ? palettes.split(',').map(Number).filter(n => !isNaN(n)) : [];

   try {
      const query = `
            SELECT f.*, 
                   v.price_new as price,
                   v.price_old,
                   v.size_name
            FROM "Flowers" f
            -- Присоединяем дефолтный вариант (Малый), чтобы забрать его цену для карточки
            INNER JOIN "Flower_Variants" v ON f.flower_id = v.flower_id AND v.is_default = TRUE
            WHERE f.is_active = TRUE
               
               -- 2. ИСПРАВЛЕННЫЙ ПОИСК
               -- Если строка пустая, условие пропускает всё. Если нет — ищет по подстроке.
               AND ($1 = '' OR (f.title ILIKE $12 OR f.description ILIKE $12))
               
               -- 3. ИСПРАВЛЕННЫЙ ФИЛЬТР ЦЕНЫ
               -- Проверяем, есть ли У ЭТОГО БУКЕТА хотя бы один вариант (любого размера), 
               -- попадающий в диапазон
               AND ($10::numeric IS NULL OR EXISTS (
                  SELECT 1 FROM "Flower_Variants" v2 
                  WHERE v2.flower_id = f.flower_id 
                  AND v2.price_new >= $10::numeric 
                  AND v2.price_new <= $11::numeric
               ))

               -- ФИЛЬТРЫ КАТЕГОРИЙ
               AND ($2 = 0 OR EXISTS (
                     SELECT 1 FROM "Flower_To_Species" fs 
                     WHERE fs.flower_id = f.flower_id 
                     AND fs.species_id = ANY($3::int[])
               ))
               AND ($4 = 0 OR f.packaging_id = ANY($5::int[]))
               AND ($6 = 0 OR f.palette_id = ANY($7::int[]))
               
            ORDER BY f.created_at DESC
            LIMIT $8 OFFSET $9
        `;

      const values = [
         searchTrimmed,       // $1 (чистая строка для проверки на пустоту)
         speciesIds.length,   // $2
         speciesIds,          // $3
         packagingIds.length, // $4
         packagingIds,        // $5
         paletteIds.length,   // $6
         paletteIds,          // $7
         parseInt(limit),     // $8
         parseInt(offset),    // $9
         minPrice,            // $10
         maxPrice,            // $11
         `%${searchTrimmed}%` // $12 (строка с процентами специально для ILIKE)
      ];

      const result = await pool.query(query, values);
      return res.status(200).json(result.rows);

   } catch (error) {
      console.error('Ошибка в getFlowersCategory:', error);
      return res.status(500).json({ message: 'Ошибка сервера' });
   }
};

// Получаем конкретный букет по id
export const getOneFlower = async (req, res) => {
   try {
      const { id } = req.params;
      const flowerQuery = await pool.query(`
            SELECT 
               f.*,
               (SELECT jsonb_agg(v ORDER BY v.variant_id) 
               FROM "Flower_Variants" v 
               WHERE v.flower_id = f.flower_id) as variants
            FROM "Flowers" f
            WHERE f.flower_id = $1 AND f.is_active = TRUE
      `, [id]);

      if (flowerQuery.rows.length === 0) {
         return res.status(404).json({ message: "Букет не найден" });
      }

      res.json(flowerQuery.rows[0]);
   } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ошибка сервера" });
   }
};