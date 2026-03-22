import express from 'express';
import * as dictController from '../controllers/dictController.js';

const dictRouter = express.Router();

// Универсальные роуты для всех справочников
// :type может быть 'palettes', 'packaging', 'species'
dictRouter.get('/:type', dictController.getAll);
dictRouter.post('/:type', dictController.create);
dictRouter.delete('/:type/:id', dictController.remove);

export default dictRouter;

