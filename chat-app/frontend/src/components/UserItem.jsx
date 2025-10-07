import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Circle, Phone, Video, MoreVertical, Trash2 } from 'lucide-react'

export default function UserItem({ user, isActive, isOnline, unreadCount, onClick, onDelete }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleClick = () => {
    if (!showDeleteConfirm) {
      onClick()
    }
  }

  const handleDeleteClick = (e) => {
    e.stopPropagation()
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = (e) => {
    e.stopPropagation()
    onDelete(user.id)
    setShowDeleteConfirm(false)
  }

  const handleDeleteCancel = (e) => {
    e.stopPropagation()
    setShowDeleteConfirm(false)
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={`w-full text-left p-4 rounded-xl transition-all duration-200 cursor-pointer backdrop-blur-sm ${
        isActive 
          ? 'bg-blue-500/20 border-2 border-blue-400/50 shadow-lg backdrop-blur-md' 
          : 'hover:bg-white/10 border-2 border-transparent hover:border-white/20'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative">
          {user.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt="Avatar" 
              className="w-12 h-12 rounded-full object-cover shadow-lg"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg">
              {user.name?.charAt(0)?.toUpperCase() || <User size={20} />}
            </div>
          )}
          {/* Online Status */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: isOnline ? 1 : 0 }}
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"
          />
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold truncate ${
              isActive ? 'text-white' : 'text-white/90'
            }`}>
              {user.name}
            </h3>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.div>
            )}
          </div>
          <p className="text-sm text-white/60 truncate">{user.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <Circle 
              size={8} 
              className={isOnline ? 'text-green-400 fill-current' : 'text-white/30'} 
            />
            <span className="text-xs text-white/50">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
            title="Call"
          >
            <Phone size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
            title="Video call"
          >
            <Video size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDeleteClick}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
            title="Delete contact"
          >
            <Trash2 size={16} />
          </motion.button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-red-500/90 backdrop-blur-sm rounded-xl flex items-center justify-center z-10"
        >
          <div className="text-center p-4">
            <div className="text-white font-semibold mb-2">Delete Contact?</div>
            <div className="text-white/80 text-sm mb-4">This will remove the contact from your list</div>
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
    </motion.div>
  )
}
