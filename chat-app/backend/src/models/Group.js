import mongoose from 'mongoose'

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member'
    }
  }],
  settings: {
    isPrivate: {
      type: Boolean,
      default: false
    },
    allowMemberInvite: {
      type: Boolean,
      default: true
    },
    allowMemberLeave: {
      type: Boolean,
      default: true
    }
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Index for efficient queries
groupSchema.index({ members: 1 })
groupSchema.index({ createdBy: 1 })
groupSchema.index({ lastActivity: -1 })

// Virtual for member count
groupSchema.virtual('memberCount').get(function() {
  return this.members.length
})

// Method to check if user is member
groupSchema.methods.isMember = function(userId) {
  return this.members.some(member => member.user.toString() === userId.toString())
}

// Method to check if user is admin
groupSchema.methods.isAdmin = function(userId) {
  return this.admins.some(admin => admin.toString() === userId.toString()) || 
         this.createdBy.toString() === userId.toString()
}

// Method to add member
groupSchema.methods.addMember = function(userId, role = 'member') {
  if (!this.isMember(userId)) {
    this.members.push({
      user: userId,
      role: role,
      joinedAt: new Date()
    })
    this.lastActivity = new Date()
  }
}

// Method to remove member
groupSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => member.user.toString() !== userId.toString())
  this.admins = this.admins.filter(admin => admin.toString() !== userId.toString())
  this.lastActivity = new Date()
}

// Method to promote to admin
groupSchema.methods.promoteToAdmin = function(userId) {
  if (this.isMember(userId) && !this.isAdmin(userId)) {
    this.admins.push(userId)
    // Update member role
    const member = this.members.find(m => m.user.toString() === userId.toString())
    if (member) {
      member.role = 'admin'
    }
  }
}

// Method to demote from admin
groupSchema.methods.demoteFromAdmin = function(userId) {
  if (this.isAdmin(userId) && this.createdBy.toString() !== userId.toString()) {
    this.admins = this.admins.filter(admin => admin.toString() !== userId.toString())
    // Update member role
    const member = this.members.find(m => m.user.toString() === userId.toString())
    if (member) {
      member.role = 'member'
    }
  }
}

export default mongoose.model('Group', groupSchema)
