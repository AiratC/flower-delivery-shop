import pool from "../config/db.js";

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