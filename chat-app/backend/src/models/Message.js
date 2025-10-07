import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema({
  emoji: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, // Optional for group messages
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', index: true }, // For group messages
    messageType: { type: String, enum: ['direct', 'group'], default: 'direct', index: true },
    text: { type: String },
    imageUrl: { type: String },
    fileAttachment: {
      fileName: { type: String },
      fileUrl: { type: String },
      fileSize: { type: Number },
      fileType: { type: String },
      mimeType: { type: String }
    },
    status: { type: String, enum: ['sent', 'delivered', 'seen'], default: 'sent', index: true },
    reactions: [reactionSchema],
    // For group messages - track who has seen the message
    seenBy: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      seenAt: { type: Date, default: Date.now }
    }],
    // For group messages - track who has received the message
    deliveredTo: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      deliveredAt: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });
messageSchema.index({ groupId: 1, createdAt: 1 });
messageSchema.index({ messageType: 1, createdAt: 1 });

export default mongoose.model('Message', messageSchema);


