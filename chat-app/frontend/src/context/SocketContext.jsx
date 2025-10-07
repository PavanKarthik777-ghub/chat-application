import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { user } = useAuth()
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [onlineMap, setOnlineMap] = useState({})

  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect()
      socketRef.current = null
      setConnected(false)
      setOnlineMap({})
      return
    }
    
    console.log('Connecting socket for user:', user.id)
    const s = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket'],
    })
    
    socketRef.current = s
    
    s.on('connect', () => {
      console.log('Socket connected')
      setConnected(true)
    })
    
    s.on('disconnect', () => {
      console.log('Socket disconnected')
      setConnected(false)
    })
    
    s.on('presence:update', ({ userId, online }) => {
      console.log(`Presence update: User ${userId} is ${online ? 'online' : 'offline'}`)
      setOnlineMap((prev) => ({
        ...prev,
        [userId]: online
      }))
    })
    
    s.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })
    
    return () => {
      console.log('Cleaning up socket connection')
      s.disconnect()
    }
  }, [user])

  const value = useMemo(() => ({ socket: socketRef.current, connected, onlineMap }), [connected, onlineMap])
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useSocket() {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocket must be used within SocketProvider')
  return ctx
}


