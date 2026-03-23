import { query } from "../config/db.js";

// Получение всех акций
export const getStocks = async (req, res) => {
   try {
      const result = await query('SELECT * FROM "Stock" ORDER BY created_at DESC');
      res.json(result.rows);
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ошибка при получении акций' });
   }
};

// Добавление акции
export const createStock = async (req, res) => {
   const { title, description } = req.body;
   // Сохраняем пути к картинкам из Multer (если есть)
   const images = req.files ? req.files.map(file => file.path) : [];

   try {
      const result = await query(
         'INSERT INTO "Stock" (title, description, stock_images) VALUES ($1, $2, $3) RETURNING *',
         [title, description, JSON.stringify(images)]
      );
      res.status(201).json(result.rows[0]);
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ошибка при создании акции' });
   }
};