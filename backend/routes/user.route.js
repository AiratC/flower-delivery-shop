import express from 'express';
import { changeData, changePassword, updateAndGetTotalSpent } from '../controllers/user.controller.js';
import { userMiddlewareCheck } from '../middleware/userMiddleware.js';

const userRouter = express.Router();

userRouter.get('/stats', userMiddlewareCheck, updateAndGetTotalSpent);

// Изменение данных
userRouter.put('/change-data', userMiddlewareCheck, changeData);

// Изменение пароля
userRouter.put('/change-password', userMiddlewareCheck, changePassword);

export default userRouter;