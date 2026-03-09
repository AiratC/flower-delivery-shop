import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
   connectionString: process.env.DATABASE_URL,
});

// Проверка связи при инициализации
pool.on('connect', () => {
   console.log('🐘 PostgreSQL подключена успешно');
});

pool.on('error', (err) => {
   console.error('❌ Ошибка пула соединений:', err.message);
});

// Экспортируем метод query, чтобы защититься от SQL-инъекций
export const query = (text, params) => pool.query(text, params);

export default pool;