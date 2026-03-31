import bcrypt from 'bcrypt'
import { query } from '../config/db.js';
import jwt from 'jsonwebtoken';
import { mergeGuestCart } from '../service/cart.service.js';

// ! Регистрация пользователя
export const registerUser = async (req, res) => {
   const { name, userEmail, password, repeatPassword, agree } = req.body;
   // Чтоб пользователь не регистрировал аккаунты например user@gmail.com и User@gmail.com
   let email = userEmail.toLowerCase().trim();

   try {
      if (!name.trim() || !email.trim() || !password.trim() || !repeatPassword.trim()) {
         return res.status(400).json({
            message: 'Заполните все поля ввода',
            error: true,
            success: false
         })
      }

      if (password !== repeatPassword) {
         return res.status(400).json({
            message: 'Пароли не равны, проверьте ввод',
            error: true,
            success: false
         })
      }

      // Проверка на согласие обработку персональных данных
      if (!agree) {
         return res.status(400).json({
            message: 'Подтвердите согласие на обработку данных',
            error: true,
            success: false
         })
      }

      // Проверка пароля на надёжность
      const specialChars = /[~!@#$%^&*()/ \\]/g;
      const countSymbol = (password.match(specialChars) || []).length;

      if (password.length < 12 || countSymbol < 4) {
         return res.status(400).json({
            message: 'Пароль должен быть от 12 символов и содержать минимум 4 спецсимвола ~!@#$%^&*()',
            error: true,
            success: false
         });
      }

      // Проверяем что в БД нет пользователя с email
      const findUser = await query(`SELECT * FROM "Users" WHERE email = $1`, [email]);

      if (findUser.rows.length > 0) {
         return res.status(409).json({
            message: `Пользователь с email: ${email} уже есть в БД`,
            error: true,
            success: false
         })
      };

      // Логика первой регистрации (Админ)
      const countUser = await query(`SELECT COUNT(*) FROM "Users"`)
      let roleId = parseInt(countUser.rows[0].count) === 0 ? 1 : 2;

      // Хешируем пароль с bcrypt
      const hashPassword = await bcrypt.hash(password, 10);

      // Добавляем пользователя в БД
      let sqlAddUser = `
      INSERT INTO "Users" (role_id, name, email, password_hash, is_agreed_terms) 
      VALUES ($1, $2, $3, $4, $5)
      `;
      await query(sqlAddUser, [roleId, name, email, hashPassword, agree]);

      return res.status(201).json({
         message: roleId === 1 ? 'Первый админ успешно зарегистрирован!' : 'Регистрация прошла успешно',
         error: false,
         success: true,
      });

   } catch (error) {
      return res.status(500).json({
         message: 'Ошибка при регистрации пользователя на сервере',
         error: true,
         success: false
      });
   };
};

// !!! Вход
export const loginUser = async (req, res) => {
   const { userEmail, password, guestToken } = req.body; // Фронтенд должен прислать guestToken

   // 1. Предварительная обработка email
   if (!userEmail.trim() || !password.trim()) {
      return res.status(400).json({
         message: 'Введите email и пароль',
         error: true,
         success: false
      })
   };

   const email = userEmail.toLowerCase().trim();

   try {
      // 2. Ищем пользователя и сразу подтягиваем название его роли (Админ/Пользователь)
      // Мы используем JOIN, чтобы на фронтенде сразу знать, пускать ли юзера в админку
      const sql = `
            SELECT u.*, r.name as role_name 
            FROM "Users" u 
            JOIN "Roles" r ON u.role_id = r.role_id 
            WHERE u.email = $1
      `;
      const result = await query(sql, [email]);

      if (result.rows.length === 0) {
         return res.status(401).json({
            message: 'Неверный email или пароль',
            error: true,
            success: false
         });
      };

      const user = result.rows[0];

      // 3. Проверяем хэш пароля
      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch) {
         return res.status(401).json({
            message: 'Неверный email или пароль',
            success: false,
            error: true
         });
      };

      await mergeGuestCart(user.user_id, guestToken);

      // 4. Генерируем JWT-токен
      // В полезную нагрузку (payload) кладем id и роль
      const token = jwt.sign(
         { userId: user.user_id, role: user.role_name },
         process.env.JWT_SECRET,
         { expiresIn: '24h' }
      );

      // 5. Отправляем токен в HTTP-Only куки
      // Это самый безопасный способ: фронтенд-скрипты не смогут украсть этот токен
      res.cookie('token', token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production', // true только если есть HTTPS (на продакшене)
         sameSite: 'strict',
         maxAge: 24 * 60 * 60 * 1000 // 24 часа
      });

      // Получаем все кроме пароля
      const { password_hash, ...userData } = user;

      // 6. Отправляем ответ без пароля
      return res.status(200).json({
         success: true,
         message: `С возвращением, ${user.name}!`,
         user: userData
      });

   } catch (error) {
      return res.status(500).json({
         message: 'Ошибка при входе на сервере',
         error: true,
         success: false
      })
   }
};

// !!! Проверка меня
export const getMe = async (req, res) => {
   try {
      // Пользователь уже прикреплен к req через middleware protectAdmin (который мы писали раньше)
      const userId = req.user.userId;

      const sql = `
      SELECT u.*, r.name as role_name 
      FROM "Users" u 
      JOIN "Roles" r ON u.role_id = r.role_id 
      WHERE u.user_id = $1
   `;
      const result = await query(sql, [userId]);

      if (result.rows.length === 0) {
         return
      }

      // Получаем все кроме пароля
      const { password_hash, ...userData } = result.rows[0];

      res.status(200).json({
         success: true,
         user: userData
      });
      
   } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера', error: true });
   }
};

// !!! Выход
export const logoutUser = async (req, res) => {
   try {
      // Очищаем куку с тем же именем 'token'
      res.clearCookie('token', {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'strict'
      });

      return res.status(200).json({
         success: true,
         message: 'Вы успешно вышли из системы'
      });
   } catch (error) {
      return res.status(500).json({ message: 'Ошибка при выходе', error: true });
   }
};