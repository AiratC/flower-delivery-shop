import pool from "./config/db.js";
import express from 'express';


const app = express();

const PORT = process.env.PORT || 8000;



// Запуск сервера с обработкой ошибок
const startServer = () => {
   try {
      app.listen(PORT, () => {
         console.log(`🚀 Сервер запущен на порту: ${PORT}`);
         // console.log(`🌐 Frontend: ${process.env.FRONTEND_URL}`);
         // console.log(`🔐 Admin: ${process.env.ADMIN_PANEL_URL}`);

         // Проверка соединения с БД
         pool.query('SELECT NOW()', (err, res) => {
            if (err) {
               console.error('❌ Ошибка подключения к PostgreSQL:', err.message);
            } else {
               console.log('🐘 PostgreSQL подключена успешно (время сервера: ' + res.rows[0].now + ')');
            }
         });
      });
   } catch (error) {
      console.error('❌ Ошибка при запуске сервера:', error.message);
      process.exit(1);
   }
};

startServer();