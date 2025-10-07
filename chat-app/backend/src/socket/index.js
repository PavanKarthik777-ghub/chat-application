import { Server } from 'socket.io';
import Message from '../models/Message.js';
import Group from '../models/Group.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const onlineUsers = new Map();

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export function createSocketServer(httpServer, clientOrigin) {
  const io = new Server(httpServer, {
    cors: { origin: clientOrigin, credentials: true },
  });

  io.use((socket, next) => {
    // Expect token from cookie header
    try {
      const cookie = socket.request.headers.cookie || '';
      const match = /(?:^|; )token=([^;]+)/.exec(cookie);
      if (!match) {
        console.log('No token found in cookies');
        return next(new Error('Authentication required'));
      }
      const token = decodeURIComponent(match[1]);
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.id;
      console.log(`User ${socket.userId} authenticated for socket connection`);
      next();
    } catch (err) {
      console.log('Socket auth error:', err.message);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`Socket connected for user: ${userId}`);
    
    if (userId) {
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} is now online. Total online: ${onlineUsers.size}`);
      io.emit('presence:update', { userId, online: true });
    }

    socket.on('typing', ({ to, typing }) => {
      const toSocket = onlineUsers.get(to);
      if (toSocket) io.to(toSocket).emit('typing', { from: userId, typing });
    });

    socket.on('message:send', async ({ to, text, imageUrl, fileAttachment, tempId, groupId }) => {
      if (!userId || (!text && !imageUrl && !fileAttachment)) return;
      
      // Determine if this is a group message or direct message
      const isGroupMessage = groupId && isValidObjectId(groupId);
      
      if (isGroupMessage) {
        // Group message
        const group = await Group.findOne({
          _id: groupId,
          'members.user': userId
        });
        
        if (!group) {
          socket.emit('error', { message: 'Group not found or access denied' });
          return;
        }
        
        const messageData = {
          senderId: userId,
          groupId: groupId,
          messageType: 'group',
          status: 'sent'
        };
        
        if (text) messageData.text = text;
        if (imageUrl) messageData.imageUrl = imageUrl;
        if (fileAttachment) messageData.fileAttachment = fileAttachment;
        
        const msg = await Message.create(messageData);
        const payload = { ...msg.toObject(), tempId };
        
        // Update group's last message and activity
        group.lastMessage = msg._id;
        group.lastActivity = new Date();
        await group.save();
        
        // Emit to all group members
        const groupMembers = group.members.map(member => member.user.toString());
        groupMembers.forEach(memberId => {
          const memberSocket = onlineUsers.get(memberId);
          if (memberSocket) {
            io.to(memberSocket).emit('message:new', payload);
            // Mark as delivered for online members
            if (memberId !== userId) {
              Message.updateOne(
                { _id: msg._id },
                { $addToSet: { deliveredTo: { userId: memberId } } }
              );
            }
          }
        });
        
        socket.emit('message:delivered', payload);
      } else {
        // Direct message (existing logic)
        const messageData = {
          senderId: userId,
          receiverId: to,
          messageType: 'direct',
          status: 'sent'
        };
        
        if (text) messageData.text = text;
        if (imageUrl) messageData.imageUrl = imageUrl;
        if (fileAttachment) messageData.fileAttachment = fileAttachment;
        
        const msg = await Message.create(messageData);
        const payload = { ...msg.toObject(), tempId };
        
        socket.emit('message:delivered', payload);
        const toSocket = onlineUsers.get(to);
        if (toSocket) {
          io.to(toSocket).emit('message:new', payload);
          await Message.updateOne({ _id: msg._id }, { $set: { status: 'delivered' } });
        }
      }
    });

    socket.on('message:seen', async ({ messageIds, from, groupId }) => {
      if (!userId) return;
      
      if (groupId && isValidObjectId(groupId)) {
        // Group message seen
        await Message.updateMany(
          { 
            _id: { $in: messageIds }, 
            groupId: groupId,
            senderId: { $ne: userId } // Don't mark own messages as seen
          }, 
          { 
            $addToSet: { 
              seenBy: { userId: userId, seenAt: new Date() }
            }
          }
        );
        
        // Notify the sender
        if (from) {
          const fromSocket = onlineUsers.get(from);
          if (fromSocket) io.to(fromSocket).emit('message:seen', { by: userId, messageIds, groupId });
        }
      } else {
        // Direct message seen (existing logic)
        await Message.updateMany({ _id: { $in: messageIds }, receiverId: userId, senderId: from }, { $set: { status: 'seen' } });
        const fromSocket = onlineUsers.get(from);
        if (fromSocket) io.to(fromSocket).emit('message:seen', { by: userId, messageIds });
      }
    });

    socket.on('message:delete', async ({ id, to, groupId }) => {
      if (!isValidObjectId(id)) return; // Ignore temp IDs
      
      if (groupId && isValidObjectId(groupId)) {
        // Group message delete
        const msg = await Message.findOneAndDelete({ _id: id, senderId: userId, groupId: groupId });
        if (msg) {
          // Notify all group members
          const group = await Group.findById(groupId);
          if (group) {
            const groupMembers = group.members.map(member => member.user.toString());
            groupMembers.forEach(memberId => {
              const memberSocket = onlineUsers.get(memberId);
              if (memberSocket) {
                io.to(memberSocket).emit('message:deleted', { id, groupId });
              }
            });
          }
        }
      } else {
        // Direct message delete (existing logic)
        const msg = await Message.findOneAndDelete({ _id: id, senderId: userId });
        if (msg) {
          socket.emit('message:deleted', { id });
          const toSocket = onlineUsers.get(to);
          if (toSocket) io.to(toSocket).emit('message:deleted', { id });
        }
      }
    });

    socket.on('message:react', async ({ messageId, emoji }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return;
        
        // Check if user already reacted with this emoji
        const existingReaction = message.reactions.find(
          r => r.userId.toString() === userId && r.emoji === emoji
        );
        
        if (existingReaction) {
          // Remove existing reaction
          message.reactions = message.reactions.filter(
            r => !(r.userId.toString() === userId && r.emoji === emoji)
          );
        } else {
          // Add new reaction
          message.reactions.push({
            emoji,
            userId,
            createdAt: new Date()
          });
        }
        
        await message.save();
        
        // Notify users based on message type
        if (message.messageType === 'group') {
          // Group message - notify all group members
          const group = await Group.findById(message.groupId);
          if (group) {
            const groupMembers = group.members.map(member => member.user.toString());
            groupMembers.forEach(memberId => {
              const memberSocket = onlineUsers.get(memberId);
              if (memberSocket) {
                io.to(memberSocket).emit('message:reacted', { messageId, reactions: message.reactions });
              }
            });
          }
        } else {
          // Direct message - notify both users
          const toSocket = onlineUsers.get(message.receiverId.toString());
          if (toSocket) io.to(toSocket).emit('message:reacted', { messageId, reactions: message.reactions });
          socket.emit('message:reacted', { messageId, reactions: message.reactions });
        }
      } catch (error) {
        console.error('Error reacting to message:', error);
      }
    });

    socket.on('disconnect', () => {
      if (userId) {
        onlineUsers.delete(userId);
        console.log(`User ${userId} disconnected. Total online: ${onlineUsers.size}`);
        io.emit('presence:update', { userId, online: false });
      }
    });
  });

  return io;
}


