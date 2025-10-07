import express from 'express';
import Group from '../models/Group.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { upload } from '../config/upload.js';

const router = express.Router();

// Create a new group
router.post('/create', requireAuth, async (req, res) => {
  try {
    const { name, description, memberIds } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!name || !memberIds || !Array.isArray(memberIds)) {
      return res.status(400).json({ error: 'Group name and member IDs are required' });
    }

    // Check if all member IDs are valid users
    const members = await User.find({ _id: { $in: memberIds } });
    if (members.length !== memberIds.length) {
      return res.status(400).json({ error: 'Some member IDs are invalid' });
    }

    // Create group with creator as admin
    const group = new Group({
      name,
      description: description || '',
      createdBy: userId,
      admins: [userId],
      members: [
        { user: userId, role: 'admin' }, // Creator is admin
        ...memberIds.map(id => ({ user: id, role: 'member' }))
      ]
    });

    await group.save();

    // Populate the group with user details
    await group.populate([
      { path: 'createdBy', select: 'name email avatar' },
      { path: 'admins', select: 'name email avatar' },
      { path: 'members.user', select: 'name email avatar' }
    ]);

    res.status(201).json({ group });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Get all groups for a user
router.get('/my-groups', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const groups = await Group.find({
      'members.user': userId
    })
    .populate('createdBy', 'name email avatar')
    .populate('admins', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .populate('lastMessage')
    .sort({ lastActivity: -1 });

    res.json({ groups });
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Get group details
router.get('/:groupId', requireAuth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findOne({
      _id: groupId,
      'members.user': userId
    })
    .populate('createdBy', 'name email avatar')
    .populate('admins', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .populate('lastMessage');

    if (!group) {
      return res.status(404).json({ error: 'Group not found or access denied' });
    }

    res.json({ group });
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// Get group messages
router.get('/:groupId/messages', requireAuth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // Check if user is member of the group
    const group = await Group.findOne({
      _id: groupId,
      'members.user': userId
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found or access denied' });
    }

    // Fetch group messages
    const messages = await Message.find({
      groupId: groupId,
      messageType: 'group'
    })
    .populate('senderId', 'name email avatarUrl')
    .sort({ createdAt: 1 });

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching group messages:', error);
    res.status(500).json({ error: 'Failed to fetch group messages' });
  }
});

// Update group info
router.put('/:groupId', requireAuth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    const { name, description } = req.body;

    const group = await Group.findOne({
      _id: groupId,
      'members.user': userId
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found or access denied' });
    }

    // Only admins can update group info
    if (!group.isAdmin(userId)) {
      return res.status(403).json({ error: 'Only admins can update group info' });
    }

    if (name) group.name = name;
    if (description !== undefined) group.description = description;

    await group.save();

    await group.populate([
      { path: 'createdBy', select: 'name email avatar' },
      { path: 'admins', select: 'name email avatar' },
      { path: 'members.user', select: 'name email avatar' }
    ]);

    res.json({ group });
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ error: 'Failed to update group' });
  }
});

// Add members to group
router.post('/:groupId/members', requireAuth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    const { memberIds } = req.body;

    if (!memberIds || !Array.isArray(memberIds)) {
      return res.status(400).json({ error: 'Member IDs are required' });
    }

    const group = await Group.findOne({
      _id: groupId,
      'members.user': userId
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found or access denied' });
    }

    // Only admins can add members
    if (!group.isAdmin(userId)) {
      return res.status(403).json({ error: 'Only admins can add members' });
    }

    // Check if all member IDs are valid users
    const users = await User.find({ _id: { $in: memberIds } });
    if (users.length !== memberIds.length) {
      return res.status(400).json({ error: 'Some member IDs are invalid' });
    }

    // Add new members
    memberIds.forEach(memberId => {
      group.addMember(memberId);
    });

    await group.save();

    await group.populate([
      { path: 'createdBy', select: 'name email avatar' },
      { path: 'admins', select: 'name email avatar' },
      { path: 'members.user', select: 'name email avatar' }
    ]);

    res.json({ group });
  } catch (error) {
    console.error('Error adding members:', error);
    res.status(500).json({ error: 'Failed to add members' });
  }
});

// Remove member from group
router.delete('/:groupId/members/:memberId', requireAuth, async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.user.id;

    const group = await Group.findOne({
      _id: groupId,
      'members.user': userId
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found or access denied' });
    }

    // Only admins can remove members, or users can remove themselves
    if (!group.isAdmin(userId) && userId !== memberId) {
      return res.status(403).json({ error: 'Only admins can remove members' });
    }

    // Creator cannot be removed
    if (group.createdBy.toString() === memberId) {
      return res.status(400).json({ error: 'Group creator cannot be removed' });
    }

    group.removeMember(memberId);
    await group.save();

    await group.populate([
      { path: 'createdBy', select: 'name email avatar' },
      { path: 'admins', select: 'name email avatar' },
      { path: 'members.user', select: 'name email avatar' }
    ]);

    res.json({ group });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// Promote member to admin
router.post('/:groupId/members/:memberId/promote', requireAuth, async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.user.id;

    const group = await Group.findOne({
      _id: groupId,
      'members.user': userId
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found or access denied' });
    }

    // Only admins can promote members
    if (!group.isAdmin(userId)) {
      return res.status(403).json({ error: 'Only admins can promote members' });
    }

    group.promoteToAdmin(memberId);
    await group.save();

    await group.populate([
      { path: 'createdBy', select: 'name email avatar' },
      { path: 'admins', select: 'name email avatar' },
      { path: 'members.user', select: 'name email avatar' }
    ]);

    res.json({ group });
  } catch (error) {
    console.error('Error promoting member:', error);
    res.status(500).json({ error: 'Failed to promote member' });
  }
});

// Demote admin to member
router.post('/:groupId/members/:memberId/demote', requireAuth, async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.user.id;

    const group = await Group.findOne({
      _id: groupId,
      'members.user': userId
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found or access denied' });
    }

    // Only admins can demote members
    if (!group.isAdmin(userId)) {
      return res.status(403).json({ error: 'Only admins can demote members' });
    }

    // Creator cannot be demoted
    if (group.createdBy.toString() === memberId) {
      return res.status(400).json({ error: 'Group creator cannot be demoted' });
    }

    group.demoteFromAdmin(memberId);
    await group.save();

    await group.populate([
      { path: 'createdBy', select: 'name email avatar' },
      { path: 'admins', select: 'name email avatar' },
      { path: 'members.user', select: 'name email avatar' }
    ]);

    res.json({ group });
  } catch (error) {
    console.error('Error demoting member:', error);
    res.status(500).json({ error: 'Failed to demote member' });
  }
});

// Leave group
router.post('/:groupId/leave', requireAuth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findOne({
      _id: groupId,
      'members.user': userId
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found or access denied' });
    }

    // If this is the last member, delete the group instead of leaving
    if (group.members.length === 1) {
      await Group.deleteOne({ _id: groupId });
      // Also delete all messages associated with this group
      await Message.deleteMany({ groupId: groupId });
      return res.json({ message: 'Group deleted successfully (last member left)' });
    }

    // Remove the member from the group
    group.members = group.members.filter(member => 
      (typeof member === 'object' ? member.user.toString() : member.toString()) !== userId
    );
    
    // If the user was an admin, remove from admins array
    if (group.admins && group.admins.includes(userId)) {
      group.admins = group.admins.filter(adminId => adminId.toString() !== userId);
    }
    
    await group.save();

    res.json({ message: 'Successfully left the group' });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ error: 'Failed to leave group' });
  }
});

// Delete group (only creator)
router.delete('/:groupId', requireAuth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findOne({
      _id: groupId,
      createdBy: userId
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found or only creator can delete' });
    }

    // Delete all messages in the group
    await Message.deleteMany({ groupId: groupId });

    // Delete the group
    await Group.findByIdAndDelete(groupId);

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

export default router;
