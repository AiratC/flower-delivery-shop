import express from 'express';
import { loginUser, registerUser } from '../controllers/auth.controller.js';

const authRouter = express.Router();

// Регистрация
authRouter.post('/register', registerUser);

// Вход
authRouter.post('/login', loginUser);

export default authRouter;
