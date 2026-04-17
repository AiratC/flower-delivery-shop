import express from 'express';
import { userMiddlewareCheck } from '../middleware/userMiddleware.js';
import { getAllOrders, getUserOrders, updateStatus } from '../controllers/orders.controller.js';

const orderRouter = express.Router();

// Получаем все заказы пользователя

orderRouter.get('/my-orders', userMiddlewareCheck, getUserOrders);

orderRouter.patch(`/:id/status`, userMiddlewareCheck, updateStatus);

orderRouter.get('/get-all-orders', userMiddlewareCheck, getAllOrders)

export default orderRouter;