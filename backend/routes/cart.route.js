import express from 'express';
import { addToCart } from '../controllers/cart.controller.js';

const cartRouter = express.Router();

// Добавление в корзину
cartRouter.post('/add-to-cart', addToCart);


export default cartRouter;