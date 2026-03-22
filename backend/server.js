import pool from "./config/db.js";
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from "./routes/auth.route.js";
import dictRouter from "./routes/referenceBooks.route.js";

const app = express();

const PORT = process.env.PORT || 8000;

// --- МИДДЛВАРЫ ---

// 1. Настройка CORS (чтобы фронтенд мог слать запросы)
app.use(cors({
  origin: [`${process.env.FRONTEND_URL}`, `${process.env.ADMIN_PANEL_URL}`], // Адрес твоего React-приложения
  credentials: true // Важно для работы с куками и сессиями
}));

// 2. Парсинг JSON (обязательно для POST-запросов)
app.use(express.json());

// 3. Парсинг кук
app.use(cookieParser());


app.use('/api/auth', authRouter);
app.use('/api/dicts', dictRouter);


// Запуск сервера с обработкой ошибок
const startServer = () => {
   try {
      app.listen(PORT, () => {
         console.log(`🚀 Сервер запущен на порту: ${PORT}`);
         console.log(`🌐 Frontend: ${process.env.FRONTEND_URL}`);
         console.log(`🔐 Admin: ${process.env.ADMIN_PANEL_URL}`);

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