import pool from "../config/db.js";

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
}