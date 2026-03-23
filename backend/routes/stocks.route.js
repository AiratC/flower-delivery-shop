import express from 'express';
import { createStock, getStocks } from '../controllers/stocks.controller.js';
import { upload } from '../middleware/upload.js';

const stocksRouter = express.Router();

// Получаем все акции
stocksRouter.get('/get-stocks', getStocks);

// Добавление акции
stocksRouter.post('/create-stock', upload.array('images', 1), createStock);


export default stocksRouter;