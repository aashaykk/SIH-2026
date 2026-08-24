/**
 * useSocket — Socket.IO connection hook
 *
 * Connects once, emits auth token, and provides
 * a typed event subscription API.
 *
 * USAGE:
 *   const { on, isConnected } = useSocket()
 *   useEffect(() => {
 *     return on('incident.created', ({ incident }) => {
 *       queryClient.invalidateQueries({ queryKey: ['incidents'] })
 *     })
 *   }, [on])
 *
 * FAILURE MODES:
 * - Backend down: reconnects every 5s, shows isConnected=false
 * - Auth invalid: server can emit 'connect_error', hook logs it
 * - Network drop: Socket.IO handles reconnect automatically
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, type Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

type EventHandler<T = unknown> = (data: T) => void

interface UseSocketReturn {
  isConnected: boolean
  /** Subscribe to a socket event. Returns an unsubscribe function. */
  on: <T>(event: string, handler: EventHandler<T>) => () => void
  /** Manually emit an event (for testing/admin actions) */
  emit: (event: string, data?: unknown) => void
}

export function useSocket(): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('nagarx_token')

    const socket = io(SOCKET_URL, {
      auth: { token },
      reconnectionAttempts: Infinity,
      reconnectionDelay: 5_000,
      transports: ['websocket', 'polling'], // fallback to polling if WS blocked
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setIsConnected(true)
      if (import.meta.env.DEV) console.log('[Socket] Connected:', socket.id)
    })

    socket.on('disconnect', (reason) => {
      setIsConnected(false)
      if (import.meta.env.DEV) console.log('[Socket] Disconnected:', reason)
    })

    socket.on('connect_error', (err) => {
      if (import.meta.env.DEV) console.error('[Socket] Connection error:', err.message)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  const on = useCallback(<T>(event: string, handler: EventHandler<T>) => {
    const socket = socketRef.current
    if (!socket) return () => {}
    socket.on(event, handler as EventHandler)
    return () => socket.off(event, handler as EventHandler)
  }, [])

  const emit = useCallback((event: string, data?: unknown) => {
    socketRef.current?.emit(event, data)
  }, [])

  return { isConnected, on, emit }
}
