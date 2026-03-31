import jwt from 'jsonwebtoken';

export const userCartMiddleware = (req, res, next) => {
   const token = req.cookies.token; // Берем токен из кук

   if (!token) {
      req.user = null;
      next();
   }

   try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded;
      next();
   } catch (error) {
      res.status(401).json({ message: 'Неверный токен' });
   }
};