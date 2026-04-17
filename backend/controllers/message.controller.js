import { query } from "../config/db.js";

export const sendMessage = async (req, res) => {
   // Даем значения по умолчанию (пустые строки), чтобы .trim() не ломался
   const { name = '', email = '', phone = '', question = '' } = req.body;

   // Проверяем обязательные поля (имя, телефон, вопрос)
   // Email проверяем только если он передан (не пустой)
   if (!name?.trim() || !phone?.trim() || !question?.trim()) {
      return res.status(400).json({
         message: 'Заполните обязательные поля: Имя, Телефон и Вопрос',
         success: false,
         error: true
      });
   }

   try {
      // Сохраняем email как null в БД, если он пустой, для чистоты данных
      const finalEmail = email?.trim() || null;

      await query(
         `
            INSERT INTO "Ask_Question" (name, email, phone, question)
            VALUES ($1, $2, $3, $4)
         `,
         [name.trim(), finalEmail, phone.trim(), question.trim()]
      );

      return res.status(200).json({
         message: 'Сообщение успешно отправлено!',
         error: false,
         success: true
      });

   } catch (error) {
      console.error('Ошибка в sendMessage:', error); // Важно логировать ошибку для дебага
      return res.status(500).json({
         message: 'Произошла ошибка при отправке сообщения',
         error: true,
         success: false
      });
   }
};

export const getQuestions = async (req, res) => {
   try {
      const result = await query('SELECT * FROM "Ask_Question" ORDER BY created_at DESC');
      res.json(result.rows);
   } catch (err) {
      res.status(500).json({ message: "Ошибка сервера" });
   }
};

export const toggleProcessStatus = async (req, res) => {
   const { id } = req.params;
   const { is_processed } = req.body;
   try {
      await query('UPDATE "Ask_Question" SET is_processed = $1 WHERE ask_question_id = $2', [is_processed, id]);
      res.json({ success: true });
   } catch (err) {
      res.status(500).json({ message: "Не удалось обновить статус" });
   }
};

export const deleteQuestion = async (req, res) => {
   const { id } = req.params;
   try {
      await query('DELETE FROM "Ask_Question" WHERE ask_question_id = $1', [id]);
      res.json({ success: true });
   } catch (err) {
      res.status(500).json({ message: "Ошибка при удалении" });
   }
};