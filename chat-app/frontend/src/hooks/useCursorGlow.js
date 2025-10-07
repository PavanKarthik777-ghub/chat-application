import { useState, useRef, useCallback } from 'react'

export function useCursorGlow() {
  const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0 })
  const [isGlowing, setIsGlowing] = useState(false)
  const inputRef = useRef(null)

  const handleMouseMove = useCallback((e) => {
    if (!inputRef.current) return
    
    const rect = inputRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setGlowPosition({ x, y })
  }, [])

  const handleMouseEnter = useCallback(() => {
    setIsGlowing(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsGlowing(false)
  }, [])

  const handleFocus = useCallback(() => {
    setIsGlowing(true)
  }, [])

  const handleBlur = useCallback(() => {
    setIsGlowing(false)
  }, [])

  return {
    glowPosition,
    isGlowing,
    inputRef,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
    handleFocus,
    handleBlur
  }
}
