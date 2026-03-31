import express from 'express';
import { addToCart, getCart } from '../controllers/cart.controller.js';
import { userCartMiddleware } from '../middleware/cartMiddleware.js';

const cartRouter = express.Router();

// Добавление в корзину
cartRouter.post('/add-to-cart', userCartMiddleware, addToCart);

// Получение корзины с данными о товарах (JOIN)
cartRouter.get('/get-cart', userCartMiddleware, getCart);

// Обновляем данные
cartRouter.patch('/update-to-cart/:id', userCartMiddleware, addToCart);


export default cartRouter;