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