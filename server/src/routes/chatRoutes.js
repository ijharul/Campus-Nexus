import express from 'express';
import { 
  sendChatRequest, 
  updateChatRequest, 
  getMyRequests, 
  getMessageHistory,
  uploadMedia,
  editMessage,
  deleteMessage,
  toggleCall
} from '../controllers/chatController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/request', sendChatRequest);
router.put('/request/:id', updateChatRequest);
router.get('/requests', getMyRequests);
router.get('/messages', getMessageHistory);

router.post('/media', upload.single('file'), uploadMedia);
router.put('/message/:id', editMessage);
router.delete('/message/:id', deleteMessage);
router.put('/request/:id/call', toggleCall);

export default router;
