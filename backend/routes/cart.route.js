import express from 'express';
import { addToCart, getCart } from '../controllers/cart.controller.js';
import { userCartMiddleware } from '../middleware/cartMiddleware.js';

const cartRouter = express.Router();

// Обрати внимание: здесь мы используем GET /
// В слайсе это будет fetchAxios.get('/cart')
cartRouter.get('/', userCartMiddleware, getCart); 

cartRouter.post('/add-to-cart', userCartMiddleware, addToCart);
cartRouter.delete('/remove/:cartItemId', userCartMiddleware, removeFromCart);
cartRouter.put('/update-quantity', userCartMiddleware, updateQuantity);


export default cartRouter;