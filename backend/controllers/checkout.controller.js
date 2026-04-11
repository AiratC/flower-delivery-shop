import { query } from "../config/db.js";

// !!! Создание заказа
export const createOrder = async (req, res) => {
   const {
      delivery_method, delivery_date, delivery_time_slot,
      call_recipient, keep_secret,
      recipient_type, recipient_name, recipient_phone,
      recipient_city, delivery_address, order_note,
      customer_name, customer_phone, customer_email, customer_city,
      payment_method, items, discount_applied // items: [{ item_id, item_type, quantity, selected_size }]
   } = req.body;

   // Получаем токен гостя или userId
   const guestToken = req.headers['x-guest-token'] || '';
   const userId = req.user ? req.user.userId : null;

   if (!items || items.length === 0) {
      return res.status(400).json({
         message: 'Корзина пуста',
         success: false,
         error: true
      })
   };

   try {
      // 1. Валидация возможности оплаты (ЛУЧШЕ ДО BEGIN)
      const initialStatus = payment_method === 'Онлайн оплата — Сбербанк' ? 'Ожидает оплаты' : 'Новый';

      if (initialStatus === 'Ожидает оплаты') {
         return res.status(400).json({
            message: 'Онлайн оплата временно не работает',
            success: false,
            error: true
         });
      }
      // Начинаем транзакцию
      await query('BEGIN');

      // Инициализируем переменную для сумирования актальной суммы товара из БД
      let serverTotal = 0;
      const validatedItems = [];

      // ! 1. Валидация цен и сбор данных
      for (const item of items) {
         let dbPrice = 0;

         // Если цветок/букет
         if (item.item_type === 'flower') {
            // Ищем конкретный вариант размера для этого букета
            const flowerRes = await query(
               `
                  SELECT f.title, fv.price_new
                  FROM "Flowers" f
                  JOIN "Flower_Variants" fv ON f.flower_id = fv.flower_id
                  WHERE f.flower_id = $1 AND fv.size_name = $2 AND f.is_active = TRUE
               `,
               [item.item_id, item.selected_size]
            );

            if (flowerRes.rows.length === 0) {
               throw new Error(`
                  Букет c ID ${item.item_id} с размером "${item.selected_size}" 
                  не найден или неактивен`
               );
            }

            dbPrice = Number(flowerRes.rows[0].price_new);
            if(isNaN(dbPrice)) throw new Error('Invalid price in database');
         }
         // Если дополнительный товар
         else if (item.item_type === 'addon') {
            // Ищем дополнительный товар
            const addonRes = await query(
               `
                  SELECT title, price
                  FROM "Addons"
                  WHERE addon_id = $1 AND is_available = TRUE
               `,
               [item.item_id]
            );

            if (addonRes.rows.length === 0) {
               throw new Error(`
                  Дополнительный товар с ID ${item.item_id} 
                  не найден или недоступен`
               );
            };

            dbPrice = Number(addonRes.rows[0].price);
            if(isNaN(dbPrice)) throw new Error('Invalid price in database');
         };

         // Накапливаем итоговую сумму на сервере
         const itemSubtotal = Number(dbPrice) * item.quantity;
         serverTotal += itemSubtotal;

         // Формируем проверенный объект для записи в Order_Items
         validatedItems.push({
            item_id: item.item_id,
            item_type: item.item_type,
            selected_size: item.selected_size,
            quantity: item.quantity,
            price_at_purchase: dbPrice
         });
      };

      // проверка скидки на сервере
      let userDiscount = 0;
      if (userId) {
         const userRes = await query('SELECT total_spent FROM "Users" WHERE id = $1', [userId]);
         const spent = userRes.rows[0]?.total_spent || 0;
         if (spent >= 90000) userDiscount = 7;
         else if (spent >= 50000) userDiscount = 5;
         else if (spent >= 10000) userDiscount = 3;
      }

      serverTotal = Math.floor(serverTotal * (1 - userDiscount / 100));

      // ! 2. Создание заказа
      const orderSql = `
            INSERT INTO "Orders" (
                  user_id, guest_token, delivery_method, delivery_date, delivery_time_slot,
                  call_recipient, keep_secret, recipient_type, recipient_name,
                  recipient_phone, recipient_city, delivery_address, order_note,
                  customer_name, customer_phone, customer_email, customer_city,
                  total_price, payment_method, status
               ) 
                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 
                  $13, $14, $15, $16, $17, $18, $19, $20)
               RETURNING order_id;
      `;

      const orderValues = [
         userId, guestToken, delivery_method, delivery_date, delivery_time_slot,
         call_recipient, keep_secret, recipient_type, recipient_name,
         recipient_phone, recipient_city, delivery_address, order_note,
         customer_name, customer_phone, customer_email, customer_city,
         serverTotal, payment_method, initialStatus
      ];

      const orderResult = await query(orderSql, orderValues);
      const newOrderId = orderResult.rows[0].order_id;

      // ! 3. Запись товаров в Order_Items
      const itemInsertSql = `
            INSERT INTO "Order_Items" (
                  order_id, item_type, item_id, selected_size, quantity, price_at_purchase
               ) VALUES ($1, $2, $3, $4, $5, $6)
         `;

      for (const vItem of validatedItems) {
         await query(itemInsertSql, [
            newOrderId,
            vItem.item_type,
            vItem.item_id,
            vItem.selected_size || null,
            vItem.quantity,
            vItem.price_at_purchase
         ])
      };

      // ! 4. Очистка корзины
      if (userId) {
         await query(`DELETE FROM "Cart" WHERE user_id = $1`, [userId]);
      } else if (guestToken) {
         await query(`DELETE FROM "Cart" WHERE guest_token = $1`, [guestToken]);
      };

      await query('COMMIT');

      return res.status(201).json({
         message: 'Заказ успешно оформлен',
         success: true,
         orderId: newOrderId,
         total: serverTotal
      })

   } catch (error) {
      await query('ROLLBACK');
      console.error('Order Error:', error.message);
      res.status(500).json({
         success: false,
         message: error.message || 'Ошибка сервера при оформлении заказа'
      });
   }
}