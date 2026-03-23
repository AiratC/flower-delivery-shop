import pool from '../config/db.js';
import fs from 'fs/promises';
import path from 'path';

export const createAddon = async (req, res) => {
   try {
      const { title, price, is_available } = req.body;

      // Берем путь к фото, если оно было загружено
      const imageUrl = req.files && req.files.length > 0
         ? `/uploads/addons/${req.files[0].filename}`
         : null;

      // Т.к. в таблице JSONB, сохраняем как массив в строке
      const imageJson = JSON.stringify(imageUrl ? [imageUrl] : []);

      const result = await pool.query(
         `INSERT INTO "Addons" (title, price, image, is_available) 
         VALUES ($1, $2, $3, $4) RETURNING addon_id`,
         [title, price, imageJson, is_available === 'true']
      );

      res.status(201).json({ success: true, addon_id: result.rows[0].addon_id });
   } catch (error) {
      console.error('Ошибка создания дополнения:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
   }
};

// Получаем доп товары
export const getAddons = async (req, res) => {
   const { page = 1, limit = 8, search = '' } = req.query;
   const offset = (page - 1) * limit;
   const searchPattern = `%${search}%`;

   try {
      // 1. Считаем общее кол-во с фильтром по поиску (регистронезависимо)
      const countRes = await pool.query(
         'SELECT COUNT(*) FROM "Addons" WHERE title ILIKE $1',
         [searchPattern]
      );

      const totalItems = parseInt(countRes.rows[0].count);
      const totalPages = Math.ceil(totalItems / limit);

      // 2. Получаем сами данные
      const dataRes = await pool.query(
         `SELECT * FROM "Addons" 
         WHERE title ILIKE $1 
         ORDER BY created_at DESC 
         LIMIT $2 OFFSET $3`,
         [searchPattern, limit, offset]
      );

      res.json({
         data: dataRes.rows,
         totalPages,
         currentPage: parseInt(page)
      });
   } catch (error) {
      console.error('Ошибка получения дополнений:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
   }
};

// Удаляем дополнительный продукт
export const deleteAddon = async (req, res) => {
   const { id } = req.params;

   try {
      // 1. Получаем данные о дополнении, чтобы забрать пути к картинкам
      const addonRes = await pool.query('SELECT image FROM "Addons" WHERE addon_id = $1', [id]);
      
      if (addonRes.rowCount === 0) {
         return res.status(404).json({ 
            message: 'Дополнение не найдено', 
            success: false 
         });
      }

      const imageData = addonRes.rows[0].image;

      // 2. Удаляем запись из базы данных
      // Здесь обычно нет связанных таблиц (как variants), поэтому транзакция не обязательна, 
      // но для порядка можно оставить.
      await pool.query('DELETE FROM "Addons" WHERE addon_id = $1', [id]);

      // 3. Удаляем файлы с сервера
      let images = [];
      try {
         // Проверка: в базе может лежать строка JSON или уже массив (зависит от того, как сохраняешь)
         images = typeof imageData === 'string' ? JSON.parse(imageData) : (imageData || []);
      } catch (e) {
         images = [];
      }

      if (Array.isArray(images)) {
         for (const imgPath of images) {
            // Формируем путь. Если картинки лежат в папке /uploads, 
            // убедись, что путь в БД совпадает с путем на диске.
            const fullPath = path.join(process.cwd(), imgPath);
            console.log(`path.join(process.cwd(), imgPath): `, path.join(process.cwd(), imgPath))
            
            try {
               await fs.unlink(fullPath);
               console.log(`Файл дополнения удален: ${fullPath}`);
            } catch (err) {
               console.error(`Файл не найден на диске: ${fullPath}`);
            }
         }
      }

      return res.status(200).json({
         message: 'Дополнение и изображения удалены',
         success: true
      });

   } catch (error) {
      console.error("Ошибка при удалении дополнения:", error);
      return res.status(500).json({ 
         message: 'Ошибка сервера', 
         success: false 
      });
   }
};