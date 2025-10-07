import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import { upload } from '../config/upload.js';

const router = Router();

// List users excluding self (basic directory)
router.get('/', requireAuth, async (req, res) => {
  const q = (req.query.q || '').toString().trim();
  const filter = {
    _id: { $ne: req.user.id },
    ...(q ? { name: { $regex: q, $options: 'i' } } : {}),
  };
  const users = await User.find(filter)
    .select('_id name email avatarUrl lastSeenAt')
    .sort({ name: 1 })
    .limit(100)
    .lean();
  res.json({ users: users.map(u => ({ id: u._id, name: u.name, email: u.email, avatarUrl: u.avatarUrl, lastSeenAt: u.lastSeenAt })) });
});

// Get online users
router.get('/online', requireAuth, (req, res) => {
  // This would need access to the onlineUsers map from socket
  // For now, return empty array - we'll handle this via socket events
  res.json({ onlineUsers: [] });
});

// Update user profile
router.put('/profile', requireAuth, upload.single('avatar'), async (req, res) => {
  try {
    const { name, email } = req.body;
    const updateData = { name, email };

    // If avatar was uploaded, add the URL
    if (req.file) {
      updateData.avatarUrl = req.file.path;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, select: '_id name email avatarUrl' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: { id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl } });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Get user settings
router.get('/settings', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('settings');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ settings: user.settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Failed to get settings' });
  }
});

// Update user settings
router.put('/settings', requireAuth, async (req, res) => {
  try {
    const { settings } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { settings } },
      { new: true, select: 'settings' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ settings: user.settings });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

export default router;


