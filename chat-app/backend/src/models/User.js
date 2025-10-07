import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true, select: false },
    avatarUrl: { type: String },
    lastSeenAt: { type: Date, default: null },
    settings: {
      // Privacy Settings
      showOnlineStatus: { type: Boolean, default: true },
      showLastSeen: { type: Boolean, default: true },
      showReadReceipts: { type: Boolean, default: true },
      
      // Notification Settings
      enableNotifications: { type: Boolean, default: true },
      enableSound: { type: Boolean, default: true },
      enableDesktopNotifications: { type: Boolean, default: true },
      
      // Auto-download Settings
      autoDownloadImages: { type: Boolean, default: true },
      autoDownloadDocuments: { type: Boolean, default: false },
      
      // Visual Settings
      fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
      theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'light' },
      chatDensity: { type: String, enum: ['compact', 'comfortable'], default: 'comfortable' },
      
      // Language & Region
      language: { type: String, default: 'en' },
      timezone: { type: String, default: 'UTC' }
    }
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPasswordIfChanged(next) {
  if (!this.isModified('password')) return next();
  const saltRounds = 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);


