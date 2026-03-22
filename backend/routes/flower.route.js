import express from 'express';
import { upload } from '../middleware/upload.js';
import { createFlower } from '../controllers/flower.controller.js';

const flowerRouter = express.Router();

// Добавление букета
flowerRouter.post('/add-flowers', upload.array('images', 10), createFlower);


export default flowerRouter;