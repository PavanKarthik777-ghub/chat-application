import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function ChatBackground() {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const particlesRef = useRef([])

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

    // Particle class for chat background
    class ChatParticle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.z = Math.random() * 800 + 1
        this.vx = (Math.random() - 0.5) * 0.3
        this.vy = (Math.random() - 0.5) * 0.3
        this.vz = Math.random() * 0.3 + 0.1
        this.size = Math.random() * 1.5 + 0.5
        this.opacity = Math.random() * 0.3 + 0.1
        this.hue = Math.random() * 40 + 200 // Blue to purple range
      }

      update() {
        this.x += this.vx
        this.y += this.vy
        this.z -= this.vz

        // Reset particle when it goes off screen or too far back
        if (this.x < 0 || this.x > canvas.width || 
            this.y < 0 || this.y > canvas.height || 
            this.z <= 0) {
          this.x = Math.random() * canvas.width
          this.y = Math.random() * canvas.height
          this.z = 800
        }
      }

      draw() {
        const scale = 150 / this.z
        const x2d = (this.x - canvas.width / 2) * scale + canvas.width / 2
        const y2d = (this.y - canvas.height / 2) * scale + canvas.height / 2
        const size2d = this.size * scale

        if (x2d >= 0 && x2d <= canvas.width && y2d >= 0 && y2d <= canvas.height) {
          ctx.save()
          ctx.globalAlpha = this.opacity * scale
          ctx.fillStyle = `hsl(${this.hue}, 60%, 70%)`
          ctx.beginPath()
          ctx.arc(x2d, y2d, size2d, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
      }
    }

    // Initialize particles
    const particleCount = 80
    particlesRef.current = []
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(new ChatParticle())
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Update and draw particles
      particlesRef.current.forEach(particle => {
        particle.update()
        particle.draw()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900" />
      
      {/* Animated Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ mixBlendMode: 'screen', opacity: 0.6 }}
      />
      
      {/* Floating Orbs */}
      <div className="absolute inset-0">
        {/* Large floating orbs */}
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-64 h-64 rounded-full blur-3xl opacity-10 bg-blue-500"
          style={{
            top: '15%',
            left: '10%',
          }}
        />
        
        <motion.div
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 0.95, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-48 h-48 rounded-full blur-3xl opacity-8 bg-purple-500"
          style={{
            top: '70%',
            right: '15%',
          }}
        />
        
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -25, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-32 h-32 rounded-full blur-3xl opacity-6 bg-indigo-500"
          style={{
            bottom: '25%',
            left: '60%',
          }}
        />
      </div>
    </div>
  )
}
