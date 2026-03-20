import jwt from 'jsonwebtoken';

export const protectAdmin = (req, res, next) => {
   const token = req.cookies.token; // Берем токен из кук

   if (!token) {
      return res.status(200).json({ message: 'Нет авторизации, доступ запрещен' });
   }

   try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Проверяем роль (мы создавали ENUM в базе: 'Админ', 'Пользователь')
      if (decoded.role !== 'Админ') {
         return res.status(403).json({ message: 'Недостаточно прав. Только для админов' });
      }

      req.user = decoded;
      next();
   } catch (error) {
      res.status(401).json({ message: 'Неверный токен' });
   }
};