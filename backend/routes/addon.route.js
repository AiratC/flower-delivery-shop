import express from 'express';
import { upload } from '../middleware/upload.js';
import { createAddon } from '../controllers/addon.controller.js';

const addonRouter = express.Router();

// Добавление дополнений (принимаем одну картинку, но через .array или .single)
addonRouter.post('/add-addons', upload.array('image', 1), createAddon);


export default addonRouter;