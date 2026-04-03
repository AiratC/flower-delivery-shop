import express from 'express';
import { upload } from '../middleware/upload.js';
import { createAddon, deleteAddon, getAddons, getAllAddons } from '../controllers/addon.controller.js';

const addonRouter = express.Router();

// Добавление дополнений (принимаем одну картинку, но через .array или .single)
addonRouter.post('/add-addons', upload.array('image', 1), createAddon);

// Получаем доп товары
addonRouter.get('/get-addons', getAddons);

// Удаление доп продукта
addonRouter.delete('/delete-addons/:id', deleteAddon);

// Получаем все аддоны
addonRouter.get('/get-all-addons', getAllAddons);


export default addonRouter;