import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import Message from '../models/Message.js';
import upload from '../middleware/upload.js'; // <-- use import, not require

const router = Router();

// GET conversation history between auth user and :userId
router.get('/:userId', requireAuth, async (req, res) => {
  const { userId } = req.params;
  const authId = req.user.id;
  // Only allow fetching between the two participants
  const messages = await Message.find({
    $or: [
      { senderId: authId, receiverId: userId },
      { senderId: userId, receiverId: authId },
    ],
  })
    .sort({ createdAt: 1 })
    .lean();

  res.json({ messages });
});

// Add this route for image upload
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  res.json({ imageUrl: req.file.path });
});

export default router;