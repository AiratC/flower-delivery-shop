import { query } from "../config/db.js";

// !!! Добавление в корзину
export const addToCart = async (req, res) => {
   const { itemId, itemType, selectedSize, quantity } = req.body;

   // Новая логика: используем 0 и пустые строки вместо NULL
   const userId = req.user ? req.user.userId : 0;
   const guestToken = req.headers['x-guest-token'] || '';
   const size = selectedSize || '';

   try {
      const querySQL = `
            INSERT INTO "Cart" (user_id, guest_token, item_id, item_type, selected_size, quantity)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (item_id, item_type, user_id, guest_token, selected_size)
            DO UPDATE SET quantity = "Cart".quantity + EXCLUDED.quantity
            RETURNING *;
      `;

      const values = [userId, guestToken, itemId, itemType, size, quantity];

      await query(querySQL, values);

      // ВАЖНО: return прерывает выполнение функции
      return res.status(200).json({
         success: true,
         message: 'Товар добавлен в корзину'
      });

   } catch (error) {
      console.error("Cart Controller Error:", error);

      // Проверяем, не был ли ответ уже отправлен (защита от двойного res.json)
      if (!res.headersSent) {
         return res.status(500).json({
            success: false,
            message: 'Ошибка сервера при добавлении в корзину',
            error: error.message
         });
      }
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
            COALESCE(fv.price_new, a.price) as price, -- Берем цену либо из вариантов, либо из аддонов
            CASE 
                  WHEN c.item_type = 'flower' THEN f.images->>0 
                  ELSE a.image->>0 
            END as image
         FROM "Cart" c
         LEFT JOIN "Flowers" f ON c.item_id = f.flower_id AND c.item_type = 'flower'
         LEFT JOIN "Flower_Variants" fv ON f.flower_id = fv.flower_id AND fv.size_name = c.selected_size
         LEFT JOIN "Addons" a ON c.item_id = a.addon_id AND c.item_type = 'addon'
         WHERE (c.user_id = $1 OR c.guest_token = $2)
         ORDER BY c.created_at DESC
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
};

// !!! Удаление товара из корзины
export const removeFromCart = async (req, res) => {
   const { cartItemId } = req.params; // ID конкретной строки в корзине
   const userId = req.user ? req.user.userId : null; // Добавляем проверку
   const guestToken = req.headers['x-guest-token'];

   try {
      await query(`
         DELETE FROM "Cart" 
               WHERE cart_item_id = $1 
               AND (user_id = $2 OR guest_token = $3)`,
         [cartItemId, userId, guestToken]);
      return res.status(200).json({ success: true, message: 'Удалено' });
   } catch (error) {
      return res.status(500).json({ success: false, message: 'Ошибка сервера' });
   }
};

// !!! Обновление количества (кнопки + и -)
export const updateQuantity = async (req, res) => {
   const { cartItemId, quantity } = req.body;
   const userId = req.user ? req.user.userId : null; // Добавляем проверку
   const guestToken = req.headers['x-guest-token'];

   try {
      if (quantity < 1) {
         return res.status(400).json({ message: 'Количество не может быть меньше 1' });
      }

      await query(
         `UPDATE "Cart" SET quantity = $1 WHERE cart_item_id = $2 AND (user_id = $3 OR guest_token = $4)`,
         [quantity, cartItemId, userId, guestToken]
      );

      return res.status(200).json({ success: true });
   } catch (error) {
      return res.status(500).json({ success: false });
   }
};