import React, { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Image, MoreVertical, Phone, Video, Search, Settings, FileText } from 'lucide-react'
import GlowInput from './GlowInput'

export default function ChatInput({ input, setInput, image, setImage, document, setDocument, fileInputRef, documentInputRef, handleImageChange, handleDocumentChange, handleSend, activeUser, chatType, activeId, activeGroupId, emitTyping }) {
  const typingTimeoutRef = useRef(null)

  const handleInputChange = (e) => {
    setInput(e.target.value)
    
    // Emit typing start
    emitTyping(true)
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // Set timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(false)
    }, 2000)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      // Stop typing when sending message
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      emitTyping(false)
      handleSend(e)
    }
  }

  const handleBlur = () => {
    // Stop typing when input loses focus
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    emitTyping(false)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])
  return (
    <div className="backdrop-blur-xl bg-white/10 border-t border-white/20 p-4 relative">
      {/* Input area glow effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/5 via-transparent to-transparent" />
      <div className="flex items-end gap-3 relative z-10">
        {/* Image Upload Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-white/70 hover:text-blue-300 hover:bg-white/10 rounded-full transition-all duration-200 backdrop-blur-sm"
          title="Attach image"
        >
          <Image size={20} />
        </motion.button>

        {/* Document Upload Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => documentInputRef.current?.click()}
          className="p-2 text-white/70 hover:text-green-300 hover:bg-white/10 rounded-full transition-all duration-200 backdrop-blur-sm"
          title="Attach document"
        >
          <FileText size={20} />
        </motion.button>
        
        {/* Hidden file inputs */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={fileInputRef}
          className="hidden"
        />
        <input
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.odt,.ods,.odp"
          onChange={handleDocumentChange}
          ref={documentInputRef}
          className="hidden"
        />

        {/* Enhanced Message Input with Glow Effect */}
        <div className="flex-1 relative">
          <GlowInput
            type="text"
            value={input}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={
              activeUser 
                ? chatType === 'group' 
                  ? `Message ${activeUser.name}...` 
                  : `Message ${activeUser.name}...`
                : 'Select a chat to start messaging'
            }
            className="w-full"
          />
        </div>

        {/* Send Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!activeUser || (!input.trim() && !image && !document)}
          className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 backdrop-blur-sm"
          title="Send message"
        >
          <Send size={18} />
        </motion.button>
      </div>
      
      {/* Image Preview */}
      {image && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200"
        >
          <div className="flex items-center gap-3">
            <img
              src={URL.createObjectURL(image)}
              alt="Preview"
              className="w-12 h-12 object-cover rounded-lg"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{image.name}</p>
              <p className="text-xs text-gray-500">{(image.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setImage(null); fileInputRef.current.value = '' }}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Document Preview */}
      {document && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 p-3 bg-green-50 rounded-xl border border-green-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{document.name}</p>
              <p className="text-xs text-gray-500">{(document.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setDocument(null); documentInputRef.current.value = '' }}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
