import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function AnimatedBackground({ variant = 'login' }) {
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

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.z = Math.random() * 1000 + 1
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.vz = Math.random() * 0.5 + 0.1
        this.size = Math.random() * 2 + 1
        this.opacity = Math.random() * 0.5 + 0.2
        this.hue = variant === 'login' ? 
          Math.random() * 60 + 200 : // Blue to purple range
          Math.random() * 60 + 280   // Purple to pink range
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
          this.z = 1000
        }
      }

      draw() {
        const scale = 200 / this.z
        const x2d = (this.x - canvas.width / 2) * scale + canvas.width / 2
        const y2d = (this.y - canvas.height / 2) * scale + canvas.height / 2
        const size2d = this.size * scale

        if (x2d >= 0 && x2d <= canvas.width && y2d >= 0 && y2d <= canvas.height) {
          ctx.save()
          ctx.globalAlpha = this.opacity * scale
          ctx.fillStyle = `hsl(${this.hue}, 70%, 60%)`
          ctx.beginPath()
          ctx.arc(x2d, y2d, size2d, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
      }
    }

    // Initialize particles
    const particleCount = 150
    particlesRef.current = []
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(new Particle())
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Update and draw particles
      particlesRef.current.forEach(particle => {
        particle.update()
        particle.draw()
      })

      // Draw connections between nearby particles
      particlesRef.current.forEach((particle, i) => {
        particlesRef.current.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 100) {
            const opacity = (100 - distance) / 100 * 0.1
            ctx.save()
            ctx.globalAlpha = opacity
            ctx.strokeStyle = `hsl(${particle.hue}, 70%, 60%)`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.stroke()
            ctx.restore()
          }
        })
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
  }, [variant])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Background */}
      <div className={`absolute inset-0 ${
        variant === 'login' 
          ? 'bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900'
          : 'bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900'
      }`} />
      
      {/* Animated Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ mixBlendMode: 'screen' }}
      />
      
      {/* Floating Orbs */}
      <div className="absolute inset-0">
        {/* Large floating orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`absolute w-96 h-96 rounded-full blur-3xl opacity-20 ${
            variant === 'login' 
              ? 'bg-blue-500' 
              : 'bg-purple-500'
          }`}
          style={{
            top: '10%',
            left: '10%',
          }}
        />
        
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`absolute w-80 h-80 rounded-full blur-3xl opacity-15 ${
            variant === 'login' 
              ? 'bg-purple-500' 
              : 'bg-pink-500'
          }`}
          style={{
            top: '60%',
            right: '10%',
          }}
        />
        
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, -40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`absolute w-64 h-64 rounded-full blur-3xl opacity-10 ${
            variant === 'login' 
              ? 'bg-indigo-500' 
              : 'bg-rose-500'
          }`}
          style={{
            bottom: '20%',
            left: '50%',
          }}
        />
      </div>
      
      {/* Subtle noise overlay */}
      <div className="absolute inset-0 opacity-5 bg-noise" />
    </div>
  )
}
