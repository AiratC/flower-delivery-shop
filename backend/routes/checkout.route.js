import express from 'express';
import { createOrder } from '../controllers/checkout.controller.js';
import { userCartMiddleware } from '../middleware/cartMiddleware.js';


const checkoutRouter = express.Router();

checkoutRouter.post('/create-order', userCartMiddleware, createOrder);

export default checkoutRouter;