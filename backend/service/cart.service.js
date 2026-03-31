import { query } from "../config/db.js";


export const mergeGuestCart = async (userId, guestToken) => {
   if(!guestToken) return;

   try {
      // 1. Переносим товары от гостя к пользователю.
      // Используем ту же логику ON CONFLICT, что и при добавлении.
      // Если такой товар уже есть у юзера, просто складываем количество.
      const mergeQuery = `
            INSERT INTO Cart (user_id, item_id, item_type, selected_size, quantity)
            SELECT $1, item_id, item_type, selected_size, quantity
            FROM Cart
            WHERE guest_token = $2
            ON CONFLICT (
                  COALESCE(user_id, 0), 
                  COALESCE(guest_token, ''), 
                  item_id, 
                  item_type, 
                  COALESCE(selected_size, '')
               )
               DO UPDATE SET quantity = Cart.quantity + EXCLUDED.quantity;
         `;
      
         await query(mergeQuery, [userId, guestToken]);

         // 2. Удаляем старые записи гостя, так как они теперь перенесены
         await query(`DELETE FROM Cart WHERE guest_token = $1`, [guestToken]);
   } catch (error) {
      console.log('Ошибка при слиянии корзины: ', error)
   }
}