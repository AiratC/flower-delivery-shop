import { query } from "../config/db.js";

// !!! Получаем все заказы пользователя
export const getUserOrders = async (req, res) => {
   const userId = req.user.userId;

   try {
      const result = await query(
         `
            SELECT
               o.order_id, 
               o.total_price as "totalPrice", 
               o.status, 
               o.created_at as "createdAt",
               json_agg(
                  json_build_object(
                  'name', COALESCE(f.title, a.title),
                  'quantity', oi.quantity,
                  'price', oi.price_at_purchase,
                  'size', oi.selected_size,
                  'type', oi.item_type
                  )
               ) as items
            FROM "Orders" o
            JOIN "Order_Items" oi ON o.order_id = oi.order_id
            LEFT JOIN "Flowers" f ON oi.item_id = f.flower_id AND oi.item_type = 'flower'
            LEFT JOIN "Addons" a ON oi.item_id = a.addon_id AND oi.item_type = 'addon'
            WHERE o.user_id = $1
            GROUP BY o.order_id
            ORDER BY o.created_at DESC
         `,
         [userId]
      );

      return res.status(200).json({
         success: true,
         orders: result.rows
      });
   } catch (error) {
      console.error(error);
      return res.status(500).json({
         success: false,
         message: 'Ошибка при получении списка заказов'
      });
   };
};

// !!! Получение всех заказов для админки
export const getAllOrders = async (req, res) => {
   try {
      const querySQL = `
            SELECT * FROM "Orders" 
            ORDER BY created_at DESC
        `;
      const result = await query(querySQL);
      res.json(result.rows);
   } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Ошибка при получении заказов' });
   }
};

// !!! Обновление статуса
export const updateStatus = async (req, res) => {
   const { id } = req.params;
   const { newStatus } = req.body;

   const FINAL_STATUSES = ['Доставлен', 'Получен', 'Отменён'];

   try {
      // Проверяем текущий статус
      const checkQuery = 'SELECT status FROM "Orders" WHERE order_id = $1';
      const checkResult = await query(checkQuery, [id]);

      if (checkResult.rows.length === 0) {
         return res.status(404).json({ message: 'Заказ не найден' });
      }

      const currentStatus = checkResult.rows[0].status;

      if (FINAL_STATUSES.includes(currentStatus)) {
         return res.status(400).json({
            message: `Нельзя изменить заказ со статусом "${currentStatus}"`
         });
      }

      await query(
         'UPDATE "Orders" SET status = $1 WHERE order_id = $2',
         [newStatus, id]
      );

      res.json({ message: 'Статус обновлен' });
   } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Ошибка сервера' });
   }
};