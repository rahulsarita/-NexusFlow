import { useEffect, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'
import useTelemetryStore from '../store/useTelemetryStore'

const getWsUrl = () => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL
  }
  if (typeof window !== 'undefined') {
    // In local Vite dev mode, connect directly to port 5000
    if (window.location.port === '5173') {
      return 'ws://localhost:5000'
    }
    // In production/Docker behind reverse proxy, connect to /ws on current host
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${window.location.host}/ws`
  }
  return 'ws://localhost:5000'
}

const WS_URL = getWsUrl()
const MAX_RETRIES = 5
const BASE_DELAY_MS = 1000

export function useWebSocket() {
  const wsRef = useRef(null)
  const retriesRef = useRef(0)
  const timeoutRef = useRef(null)
  const mountedRef = useRef(true)

  const { addTelemetryPoint, addAlert, setConnected } = useTelemetryStore()

  const connect = useCallback(() => {
    if (!mountedRef.current) return

    try {
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        retriesRef.current = 0
        setConnected(true)
        console.log('[WS] Connected to NexusFlow server')
      }

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          const { type, payload } = msg

          switch (type) {
            case 'TELEMETRY':
              addTelemetryPoint(payload)
              break

            case 'ALERT':
              addAlert(payload)
              toast(
                `🚨 ${payload.severity?.toUpperCase() || 'ALERT'}: ${payload.message || 'Threshold triggered'}`,
                {
                  duration: 5000,
                  style: {
                    background:
                      payload.severity === 'critical'
                        ? 'rgba(239,68,68,0.15)'
                        : payload.severity === 'warning'
                        ? 'rgba(234,179,8,0.15)'
                        : 'rgba(14,165,233,0.15)',
                    border: `1px solid ${
                      payload.severity === 'critical'
                        ? '#ef4444'
                        : payload.severity === 'warning'
                        ? '#eab308'
                        : '#0ea5e9'
                    }`,
                    color: '#e2e8f0',
                  },
                }
              )
              break

            case 'CONNECTED':
              setConnected(true)
              break

            default:
              break
          }
        } catch (err) {
          console.warn('[WS] Failed to parse message:', err)
        }
      }

      ws.onclose = () => {
        setConnected(false)
        if (!mountedRef.current) return

        if (retriesRef.current < MAX_RETRIES) {
          const delay = BASE_DELAY_MS * Math.pow(2, retriesRef.current)
          retriesRef.current += 1
          console.log(`[WS] Reconnecting in ${delay}ms (attempt ${retriesRef.current}/${MAX_RETRIES})`)
          timeoutRef.current = setTimeout(() => {
            if (mountedRef.current) connect()
          }, delay)
        } else {
          console.warn('[WS] Max retries reached. Giving up.')
          toast.error('WebSocket connection lost. Please refresh.', { duration: 10000 })
        }
      }

      ws.onerror = (err) => {
        console.error('[WS] Error:', err)
        ws.close()
      }
    } catch (err) {
      console.error('[WS] Failed to create WebSocket:', err)
    }
  }, [addTelemetryPoint, addAlert, setConnected])

  useEffect(() => {
    mountedRef.current = true
    connect()

    return () => {
      mountedRef.current = false
      clearTimeout(timeoutRef.current)
      if (wsRef.current) {
        wsRef.current.onclose = null
        wsRef.current.close()
      }
      setConnected(false)
    }
  }, [connect, setConnected])

  return wsRef
}
