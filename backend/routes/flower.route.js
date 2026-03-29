import express from 'express';
import { upload } from '../middleware/upload.js';
import { createFlower, deleteFlower, getFlowers, getFlowersCategory, getOneFlower } from '../controllers/flower.controller.js';

const flowerRouter = express.Router();

// Добавление букета
flowerRouter.post('/add-flowers', upload.array('images', 10), createFlower);

// Получаем цветы
flowerRouter.get('/get-flowers', getFlowers);

// Удаление букета
flowerRouter.delete('/delete-flower/:id', deleteFlower);

// Получаем все цветы с пагинацией показать ещё
flowerRouter.get('/get-flowers-catalog', getFlowersCategory);

// Получаем конкретный букет по id
flowerRouter.get(`/get-one-flower/:id`, getOneFlower)


export default flowerRouter;