import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Crown, Trash2, X, LogOut } from 'lucide-react'

export default function GroupItem({ group, isActive, onClick, unreadCount = 0, onDelete, onLeave, currentUserId }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  
  const handleClick = () => {
    if (!showDeleteConfirm && !showLeaveConfirm) {
      onClick(group)
    }
  }

  const handleDeleteClick = (e) => {
    e.stopPropagation()
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = (e) => {
    e.stopPropagation()
    onDelete(group._id)
    setShowDeleteConfirm(false)
  }

  const handleDeleteCancel = (e) => {
    e.stopPropagation()
    setShowDeleteConfirm(false)
  }

  const handleLeaveClick = (e) => {
    e.stopPropagation()
    setShowLeaveConfirm(true)
  }

  const handleLeaveConfirm = (e) => {
    e.stopPropagation()
    onLeave(group._id)
    setShowLeaveConfirm(false)
  }

  const handleLeaveCancel = (e) => {
    e.stopPropagation()
    setShowLeaveConfirm(false)
  }

  // Check if current user can delete the group (creator or admin) - Fixed logic
  const canDelete = group.creator === currentUserId || 
                   group.admins?.some(adminId => String(adminId) === String(currentUserId)) ||
                   group.members?.find(member => {
                     const memberId = typeof member === 'object' ? member.user : member;
                     return String(memberId) === String(currentUserId) && member.role === 'creator';
                   })

  // Check if current user can leave the group - Fixed logic
  const canLeave = group.members?.some(member => {
    const memberId = typeof member === 'object' ? member.user : member;
    return String(memberId) === String(currentUserId);
  })

  // Debug logging removed - functionality working

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-200 ${
        isActive
          ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-blue-400/50 shadow-lg shadow-blue-500/20'
          : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
      }`}
    >
      {/* Background Glow Effect */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl" />
      )}
      
      <div className="relative flex items-center gap-3">
        {/* Group Avatar */}
        <div className="relative">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
            isActive 
              ? 'bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg shadow-blue-500/30' 
              : 'bg-gradient-to-br from-green-400 to-blue-500'
          }`}>
            {group.name.charAt(0).toUpperCase()}
          </div>
          
          {/* Online Indicator */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white/20 flex items-center justify-center">
            <Users size={8} className="text-white" />
          </div>
        </div>

        {/* Group Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-semibold truncate ${
              isActive ? 'text-white' : 'text-white/90'
            }`}>
              {group.name}
            </h3>
            
            {/* Admin Badge */}
            {group.isAdmin && (
              <Crown size={14} className="text-yellow-400 flex-shrink-0" />
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <p className={`text-sm truncate ${
              isActive ? 'text-white/80' : 'text-white/60'
            }`}>
              {group.lastMessage?.text || 'No messages yet'}
            </p>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Member Count */}
              <div className="flex items-center gap-1">
                <Users size={12} className="text-white/40" />
                <span className="text-xs text-white/60">{group.members?.length || 0}</span>
              </div>
              
              {/* Unread Count */}
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-blue-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 font-medium"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </motion.div>
              )}

              {/* Delete Button */}
              {canDelete && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDeleteClick}
                  className="p-2 text-red-400 bg-red-500/20 hover:text-red-300 hover:bg-red-500/30 rounded-full transition-all duration-200 border border-red-400/30"
                  title="Delete group"
                >
                  <Trash2 size={16} />
                </motion.button>
              )}

              {/* Leave Button */}
              {canLeave && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLeaveClick}
                  className="p-2 text-orange-400 bg-orange-500/20 hover:text-orange-300 hover:bg-orange-500/30 rounded-full transition-all duration-200 border border-orange-400/30"
                  title="Leave group"
                >
                  <LogOut size={16} />
                </motion.button>
              )}
            </div>
          </div>
          
          {/* Last Message Time */}
          {group.lastMessage && (
            <p className={`text-xs mt-1 ${
              isActive ? 'text-white/60' : 'text-white/40'
            }`}>
              {new Date(group.lastMessage.createdAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          )}
        </div>
      </div>

      {/* Active Indicator */}
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-full"
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-red-500/90 backdrop-blur-sm rounded-xl flex items-center justify-center z-10"
        >
          <div className="text-center p-4">
            <div className="text-white font-semibold mb-2">Delete Group?</div>
            <div className="text-white/80 text-sm mb-4">This action cannot be undone</div>
            <div className="flex gap-2 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDeleteConfirm}
                className="px-3 py-1 bg-white text-red-500 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Delete
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDeleteCancel}
                className="px-3 py-1 bg-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-orange-500/90 backdrop-blur-sm rounded-xl flex items-center justify-center z-10"
        >
          <div className="text-center p-4">
            <div className="text-white font-semibold mb-2">
              {group.members.length === 1 ? 'Delete Group?' : 'Leave Group?'}
            </div>
            <div className="text-white/80 text-sm mb-4">
              {group.members.length === 1 
                ? 'This will permanently delete the group since you are the only member'
                : 'You will no longer receive messages from this group'
              }
            </div>
            <div className="flex gap-2 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLeaveConfirm}
                className="px-3 py-1 bg-white text-orange-500 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
              >
                {group.members.length === 1 ? 'Delete' : 'Leave'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLeaveCancel}
                className="px-3 py-1 bg-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
