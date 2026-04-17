import express from 'express';
import { deleteQuestion, getQuestions, sendMessage } from '../controllers/message.controller.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const messageRouter = express.Router();

// Отправка сообщения клиентом
messageRouter.post('/send-message', sendMessage);

messageRouter.get(`/questions`, protectAdmin, getQuestions);

messageRouter.patch(`/questions/:id`, protectAdmin, deleteQuestion);

messageRouter.delete(`/questions/:id`, protectAdmin, deleteQuestion);

export default messageRouter;