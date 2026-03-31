import { query } from "../config/db.js";

// !!! Добавление в корзину
export const addToCart = async (req, res) => {
   const { itemId, itemType, selectedSize, quantity } = req.body;
   const userId = req.user ? req.user.userId : null;
   const guestToken = req.headers['x-guest-token'];

   try {
      // Логика "Upsert" (Insert or Update)
      // Мы ищем товар с таким же ID, типом и размером для конкретного юзера или гостя
      const querySQL = `
            INSERT INTO Cart (user_id, guest_token, item_id, item_type, selected_size, quantity)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (
                  COALESCE(user_id, 0), 
                  COALESCE(guest_token, ''), 
                  item_id, 
                  item_type, 
                  COALESCE(selected_size, '')
               )
               DO UPDATE SET quantity = Cart.quantity + EXCLUDED.quantity
               RETURNING *;
         `;

      const values = [
         userId,
         userId ? null : guestToken,
         itemId,
         itemType,
         selectedSize || '', // Для аддонов записываем пустую строку вместо null для корректного UNIQUE
         quantity
      ];

      await query(querySQL, values);

      return res.status(200).json({
         message: 'Добавлено в корзину',
         error: false,
         success: true
      })
   } catch (error) {
      console.log(error);
      return res.status(500).json({
         message: 'Ошибка сервера',
         error: true,
         success: false
      })
   }
};

// !!! Получение корзины с данными о товарах (JOIN)
export const getCart = async (req, res) => {
   const userId = req.user ? req.user.userId : null;
   const guestToken = req.headers['x-guest-token'];

   try {
      const querySQL = `
         SELECT 
               c.cart_item_id, c.item_id, c.item_type, c.selected_size, c.quantity,
               CASE 
                  WHEN c.item_type = 'flower' THEN f.title 
                  ELSE a.title 
               END as title,
               CASE 
                  WHEN c.item_type = 'flower' THEN (SELECT price_new FROM Flower_Variants WHERE flower_id = f.flower_id AND size_name = c.selected_size)
                  ELSE a.price 
               END as price,
               CASE 
                  WHEN c.item_type = 'flower' THEN f.images->>0 
                  ELSE a.image->>0 
               END as image
         FROM Cart c
         LEFT JOIN Flowers f ON c.item_id = f.flower_id AND c.item_type = 'flower'
         LEFT JOIN Addons a ON c.item_id = a.addon_id AND c.item_type = 'addon'
         WHERE (c.user_id = $1 OR c.guest_token = $2)
      `;

      const result = await query(querySQL, [userId, guestToken]);

      return res.status(200).json(result.rows);

   } catch (error) {
      console.log(error);
      return res.status(500).json({
         message: 'Ошибка сервера',
         error: true,
         success: false
      })
   }
}