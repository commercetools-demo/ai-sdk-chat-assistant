import { Router } from 'express';
import {
  post
} from '../controllers/chat.controller';
import { logger } from '../utils/logger.utils';

const chatRouter = Router();

chatRouter.post('/', async (req, res, next) => {
  try {
    post(req, res);
  } catch (error) {
    logger.error('Error processing chat request:', error);
    res.status(500).json({ 
      error: 'Failed to process chat request', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default chatRouter;
