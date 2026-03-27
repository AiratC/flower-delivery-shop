import express from 'express';
import { sendMessage } from '../controllers/message.controller.js';

const messageRouter = express.Router();

// Отправка сообщения клиентом
messageRouter.post('/send-message', sendMessage);

export default messageRouter;