import express from 'express';
import { getMe, loginUser, registerUser } from '../controllers/auth.controller.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const authRouter = express.Router();

// Регистрация
authRouter.post('/register', registerUser);

// Вход
authRouter.post('/login', loginUser);

// Проверка меня
authRouter.get('/me', protectAdmin, getMe);

export default authRouter;
