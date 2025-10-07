import React, { useEffect, useRef } from 'react'

export default function ChatOrbs() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationId

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Orb class
    class Orb {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.radius = Math.random() * 100 + 50
        this.opacity = Math.random() * 0.3 + 0.1
        this.hue = Math.random() * 60 + 200 // Blue to purple range (200-260)
        this.pulseSpeed = Math.random() * 0.02 + 0.01
        this.pulsePhase = Math.random() * Math.PI * 2
      }

      update() {
        this.x += this.vx
        this.y += this.vy
        this.pulsePhase += this.pulseSpeed

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1

        // Keep orbs in bounds
        this.x = Math.max(0, Math.min(canvas.width, this.x))
        this.y = Math.max(0, Math.min(canvas.height, this.y))
      }

      draw() {
        const pulse = Math.sin(this.pulsePhase) * 0.1 + 0.9
        const currentRadius = this.radius * pulse
        const currentOpacity = this.opacity * pulse

        // Create gradient
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, currentRadius
        )
        
        gradient.addColorStop(0, `hsla(${this.hue}, 70%, 60%, ${currentOpacity})`)
        gradient.addColorStop(0.5, `hsla(${this.hue}, 60%, 50%, ${currentOpacity * 0.5})`)
        gradient.addColorStop(1, `hsla(${this.hue}, 50%, 40%, 0)`)

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Create orbs
    const orbs = []
    const orbCount = Math.floor((canvas.width * canvas.height) / 50000) + 3 // Responsive count
    
    for (let i = 0; i < orbCount; i++) {
      orbs.push(new Orb())
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      orbs.forEach(orb => {
        orb.update()
        orb.draw()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ 
        background: 'transparent',
        mixBlendMode: 'screen'
      }}
    />
  )
}
