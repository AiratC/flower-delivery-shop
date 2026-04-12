import { query } from "../config/db.js";

export const updateAndGetTotalSpent = async (req, res) => {
   try {
      const userId = req.user.userId; // Получаем ID из middleware авторизации

      // 1. Считаем сумму всех успешных заказов в таблице orders
      const result = await query(
         `SELECT SUM(total_price) as total 
         FROM "Orders" 
         WHERE user_id = $1 AND (status = 'Доставлено' OR status = 'Получен')`,
         [userId]
      );

      // Превращаем в число, чтобы в базу и на фронт ушло Number
      const newTotal = Number(result.rows[0].total) || 0;

      // 2. Обновляем поле total_spent в таблице users
      const updatedUser = await query(
         `UPDATE "Users" SET total_spent = $1 WHERE user_id = $2 RETURNING *`,
         [newTotal, userId]
      );

      const { password_hash, ...userData } = updatedUser.rows[0];
      // Возвращаем обновленного пользователя
      res.json(userData);
   } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Ошибка при подсчете суммы заказов" });
   }
};

// !!! Изменение данных
export const changeData = async (req, res) => {
   const { name = null, phone = null, city = null, delivery_address = null } = req.body;
   const userId = req.user.userId;

   try {
      const result = await query(
         `
            UPDATE "Users"
            SET name = $1, phone = $2, city = $3, delivery_address = $4
            WHERE user_id = $5 RETURNING *
         `,
         [name, phone, city, delivery_address, userId]
      );

      const { password_hash, ...userData } = result.rows[0];

      return res.status(200).json({
         user: userData,
         success: true,
         error: false
      })
   } catch (error) {
      if(error.code === '23505') {
         return res.status(400).json({
            message: 'Этот номер телефона уже используется',
            success: false
         });
      }
      return res.status(500).json({ 
         message: "Server error: status 500",
         success: false,
         error: true
      });
   }
}