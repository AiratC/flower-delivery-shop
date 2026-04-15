import express from 'express';
import { userMiddlewareCheck } from '../middleware/userMiddleware.js';
import { getUserOrders } from '../controllers/orders.controller.js';

const orderRouter = express.Router();

// Получаем все заказы пользователя

orderRouter.get('/my-orders', userMiddlewareCheck, getUserOrders);

export default orderRouter;