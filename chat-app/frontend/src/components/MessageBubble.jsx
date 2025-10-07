import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek } from 'date-fns'
import { Check, CheckCheck, MoreVertical, Trash2 } from 'lucide-react'
import DocumentAttachment from './DocumentAttachment'

export default function MessageBubble({ message, isOwn, onDelete, showSenderName = false, senderName = null }) {
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <Check size={12} className="text-gray-400" />
      case 'delivered':
        return <CheckCheck size={12} className="text-gray-400" />
      case 'seen':
        return <CheckCheck size={12} className="text-blue-500" />
      default:
        return null
    }
  }

  const formatTimestamp = (timestamp) => {
    const messageDate = new Date(timestamp)
    const now = new Date()
    
    // For messages less than 1 minute ago
    if (now - messageDate < 60000) {
      return 'Just now'
    }
    
    // For messages less than 1 hour ago
    if (now - messageDate < 3600000) {
      return formatDistanceToNow(messageDate, { addSuffix: true })
    }
    
    // For today's messages
    if (isToday(messageDate)) {
      return format(messageDate, 'HH:mm')
    }
    
    // For yesterday's messages
    if (isYesterday(messageDate)) {
      return `Yesterday ${format(messageDate, 'HH:mm')}`
    }
    
    // For this week's messages
    if (isThisWeek(messageDate)) {
      return format(messageDate, 'EEEE HH:mm')
    }
    
    // For older messages
    return format(messageDate, 'MMM d, HH:mm')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`group relative max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`relative px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm ${
            isOwn 
              ? 'bg-gradient-to-r from-blue-500/90 to-blue-600/90 text-white rounded-br-md border border-blue-400/30' 
              : 'bg-white/20 border border-white/30 text-white rounded-bl-md backdrop-blur-md'
          }`}
        >
          {/* Sender Name for Group Messages */}
          {showSenderName && senderName && !isOwn && (
            <div className="text-xs font-semibold text-white/70 mb-1">
              {senderName}
            </div>
          )}
          
          {/* Message Content */}
          {message.text && (
            <div className="whitespace-pre-wrap break-words leading-relaxed">
              {message.text}
            </div>
          )}
          
          {/* Image */}
          {message.imageUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="mt-2"
            >
              {message.imageUrl === 'uploading...' ? (
                <div className="max-w-xs rounded-lg bg-gray-200 flex items-center justify-center h-32">
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                    <span className="text-sm">Uploading...</span>
                  </div>
                </div>
              ) : (
                <img
                  src={message.imageUrl}
                  alt="Shared image"
                  className="max-w-xs rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                  onClick={() => window.open(message.imageUrl, '_blank')}
                />
              )}
            </motion.div>
          )}

          {/* Document Attachment */}
          {message.fileAttachment && (
            <DocumentAttachment 
              attachment={message.fileAttachment} 
              isOwn={isOwn} 
            />
          )}

          {/* Timestamp and Status */}
          <div className={`flex items-center gap-1 mt-2 text-xs ${
            isOwn ? 'text-blue-100' : 'text-gray-500'
          }`}>
            <span title={format(new Date(message.createdAt), 'PPpp')}>
              {formatTimestamp(message.createdAt)}
            </span>
            {isOwn && getStatusIcon(message.status)}
          </div>



          {/* Delete Button */}
          {isOwn && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(message._id)}
              className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100"
              title="Delete message"
            >
              <Trash2 size={12} />
            </motion.button>
          )}
        </motion.div>

        {/* Message Tail */}
        <div className={`absolute top-0 w-3 h-3 ${
          isOwn 
            ? 'right-0 bg-blue-500 transform rotate-45 translate-x-1.5 -translate-y-1' 
            : 'left-0 bg-white border-l border-b border-gray-200 transform rotate-45 -translate-x-1.5 -translate-y-1'
        }`} />
      </div>
    </motion.div>
  )
}
