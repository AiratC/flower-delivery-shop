import express from 'express';
import { updateAndGetTotalSpent } from '../controllers/user.controller.js';
import { userMiddlewareCheck } from '../middleware/userMiddleware.js';

const userRouter = express.Router();

userRouter.get('/stats', userMiddlewareCheck, updateAndGetTotalSpent);

export default userRouter;