import React from 'react'
import { motion } from 'framer-motion'
import { useCursorGlow } from '../hooks/useCursorGlow'

export default function GlowInput({ 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  icon: Icon, 
  showPassword, 
  onTogglePassword,
  className = '',
  onKeyDown,
  onBlur,
  ...props 
}) {
  const {
    glowPosition,
    isGlowing,
    inputRef,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
    handleFocus,
    handleBlur
  } = useCursorGlow()

  return (
    <div className="relative">
      <div className="relative glow-input">
        {/* Dynamic Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden"
          style={{
            background: `radial-gradient(circle at ${glowPosition.x}px ${glowPosition.y}px, 
              rgba(59, 130, 246, 0.4) 0%, 
              rgba(147, 51, 234, 0.3) 25%, 
              rgba(236, 72, 153, 0.2) 50%, 
              transparent 70%)`,
            filter: 'blur(1px)',
          }}
          animate={{
            opacity: isGlowing ? 1 : 0,
            scale: isGlowing ? 1.05 : 1,
          }}
          transition={{
            duration: 0.3,
            ease: "easeOut"
          }}
        />
        
        {/* Secondary Glow Layer */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${glowPosition.x}px ${glowPosition.y}px, 
              rgba(255, 255, 255, 0.2) 0%, 
              transparent 50%)`,
            filter: 'blur(2px)',
          }}
          animate={{
            opacity: isGlowing ? 0.8 : 0,
          }}
          transition={{
            duration: 0.2,
            ease: "easeOut"
          }}
        />
        
        {/* Input Field */}
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5 z-10 transition-colors duration-200" />
          )}
          
          <input
            ref={inputRef}
            type={type}
            value={value}
            onChange={onChange}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            onBlur={onBlur || handleBlur}
            onKeyDown={onKeyDown}
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} ${onTogglePassword ? 'pr-12' : 'pr-4'} py-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm text-white placeholder-white/50 relative z-10 hover:bg-white/15 focus:bg-white/20 ${className}`}
            placeholder={placeholder}
            {...props}
          />
          
          {onTogglePassword && (
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors z-10 p-1 rounded-md hover:bg-white/10"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
