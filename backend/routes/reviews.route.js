import express from 'express';
import { createReview, getPurchasedItemsWithoutReviews, getReviews } from '../controllers/reviews.controller.js';
import { userCartMiddleware } from '../middleware/cartMiddleware.js';
import { upload } from '../middleware/upload.js';

const reviewsRouter = express.Router();

// Создание отзыва
reviewsRouter.post('/create-review', upload.array('photo', 1), userCartMiddleware, createReview);

// Получаем отзывы
reviewsRouter.get('/get-reviews', getReviews);

// Загрузка доступных отзывов на товары
reviewsRouter.get('/get-purchased-items', getPurchasedItemsWithoutReviews);

export default reviewsRouter;