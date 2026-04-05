import express from 'express';
import { createOrder } from '../controllers/checkout.controller.js';


const checkoutRouter = express.Router();

checkoutRouter.post('/create-order', createOrder);

export default checkoutRouter;