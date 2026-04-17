import { query } from './../config/db.js'

// !!! Получаем отзывы
export const getReviews = async (req, res) => {
   const { type, page = 1, limit = 10 } = req.query;
   const offset = (page - 1) * limit;

   try {
      const condition = type === 'photo' ? 'photo IS NOT NULL' : 'photo IS NULL';

      // Получаем сами данные
      const dataQuery = query(
         `
         SELECT * FROM "Reviews" WHERE ${condition} ORDER BY created_at DESC LIMIT $1 OFFSET $2
         `,
         [limit, offset]
      );

      // Получаем общее кол-во для расчета страниц
      const countQuery = query(
         `
         SELECT COUNT(*) FROM "Reviews" WHERE ${condition}
         `
      );

      const [dataRes, countRes] = await Promise.all([dataQuery, countQuery]);

      return res.status(200).json({
         data: dataRes.rows,
         totlaCount: parseInt(countRes.rows[0].count),
         totalPages: Math.ceil(parseInt(countRes.rows[0].count) / limit)
      });


   } catch (error) {
      console.log(error)
      return res.status(500).json({
         message: 'Ошибка при получении отзывов',
         error: true,
         success: false
      })
   }
}

// !!! Создание отзыва
export const createReview = async (req, res) => {
   const { flower_id, order_item_id, name, email, city, comment, rating, photo } = req.body;
   const userId = req.user ? req.user.userId : null;
   const guestToken = req.headers['x-guest-token'] || null;

   // Берем путь к фото, если оно было загружено
      const imageUrl = req.files && req.files.length > 0
         ? `/uploads/reviews/${req.files[0].filename}`
         : null;

   try {
      // Проверка покупки (с учетом твоей структуры Order_Items и возможности гостя)
      const orderCheck = await query(
         `
            SELECT oi.order_item_id
            FROM "Order_Items" oi
            JOIN "Orders" o ON oi.order_id = o.order_id
            WHERE oi.order_item_id = $1 
            AND oi.item_id = $2
            AND (o.user_id = $3 OR o.guest_token = $4)
         `,
         [order_item_id, flower_id, userId, guestToken]
      );

      if (orderCheck.rowCount === 0) {
         return res.status(403).json({ message: 'Товар не найден в ваших покупках', error: true });
      }

      // Проверка на дубликат отзыва
      const reviewCheck = await query(
         `SELECT review_id FROM "Reviews" WHERE order_item_id = $1`,
         [order_item_id]
      );

      if (reviewCheck.rowCount > 0) {
         return res.status(400).json({ message: 'Отзыв уже оставлен', error: true });
      }

      // Сохранение в базу (user_id может быть null, тогда запишется guest_token)
      await query(
         `
            INSERT INTO "Reviews" 
            (user_id, guest_token, flower_id, order_item_id, name, email, city, comment, rating, photo)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         `,
         [userId, guestToken, flower_id, order_item_id, name, email, city, comment, rating, imageUrl]
      );

      return res.status(201).json({ message: 'Спасибо за отзыв!', success: true });

   } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Ошибка сервера' });
   }
};

// !!! Получаем товары под отзыв
export const getPurchasedItemsWithoutReviews = async (req, res) => {
   const userId = req.user ? req.user.userId : null;
   const guestToken = req.headers['x-guest-token'] || null;

   try {
      if (!userId && !guestToken) {
         return res.status(200).json([]);
      }

      const result = await query(
         `
            SELECT 
                  oi.order_item_id, 
                  oi.item_id AS flower_id, 
                  f.title AS flower_name
            FROM "Order_Items" oi
            JOIN "Orders" o ON oi.order_id = o.order_id
            JOIN "Flowers" f ON oi.item_id = f.flower_id
            LEFT JOIN "Reviews" r ON oi.order_item_id = r.order_item_id
            WHERE (o.user_id = $1 OR o.guest_token = $2)
            AND oi.item_type = 'flower'
            AND r.review_id IS NULL
            `,
         [userId, guestToken]
      );

      res.status(200).json(result.rows);
   } catch (error) {
      console.error("SQL Error in getPurchasedItemsWithoutReviews:", error);
      res.status(500).json({
         message: 'Ошибка при получении списка товаров',
         error: true
      });
   }
};