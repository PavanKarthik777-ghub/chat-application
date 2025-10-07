import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, User, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function ChatHeader({ activeUser, typingFrom, chatType, onProfileClick, onGroupInfoClick }) {
  const { user, logout } = useAuth()

  return (
    <div className="backdrop-blur-xl bg-white/10 border-b border-white/20 px-6 py-4 relative overflow-hidden">
      {/* Header glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-transparent" />
      <div className="flex items-center justify-between relative z-10">
        {/* User Info */}
        <div className="flex items-center gap-4">
          {activeUser ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              {activeUser.avatarUrl ? (
                <img 
                  src={activeUser.avatarUrl} 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-full object-cover shadow-lg"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                  {activeUser.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="font-semibold text-white">{activeUser.name}</h2>
                <AnimatePresence>
                  {typingFrom && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-1 text-sm text-blue-600"
                    >
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-2 h-2 bg-blue-600 rounded-full"
                      />
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-blue-600 rounded-full"
                      />
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-blue-600 rounded-full"
                      />
                      <span className="ml-2">typing...</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <div className="text-white/70">Select a user to start chatting</div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {chatType === 'group' && activeUser && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGroupInfoClick}
              className="p-2 text-white/70 hover:text-blue-300 hover:bg-white/10 rounded-full transition-all duration-200 backdrop-blur-sm"
              title="Group Info"
            >
              <Settings size={20} />
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onProfileClick}
            className="p-2 text-white/70 hover:text-blue-300 hover:bg-white/10 rounded-full transition-all duration-200 backdrop-blur-sm"
            title="Edit Profile"
          >
            <User size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="p-2 text-white/70 hover:text-red-300 hover:bg-white/10 rounded-full transition-all duration-200 backdrop-blur-sm"
            title="Logout"
          >
            <LogOut size={20} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
