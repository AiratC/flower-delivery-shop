import jwt from 'jsonwebtoken';

export const userCartMiddleware = (req, res, next) => {
   const token = req.cookies.token;

   if (!token) {
      req.user = null;
      return next(); // Обязательно return, чтобы код ниже не шел
   }

   try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next(); // Токен валиден
   } catch (error) {
      // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: 
      // Если токен неверный или истек, мы НЕ кидаем ошибку 401.
      // Мы просто помечаем пользователя как гостя.
      console.log('JWT Error (User treated as guest):', error.message);
      req.user = null; 
      return next(); 
   }
};