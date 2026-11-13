import { create } from 'zustand'
import axios from 'axios'

const MAX_POINTS = 60

const useTelemetryStore = create((set, get) => ({
  telemetryData: {
    'turbine-1': [],
    'pump-2': [],
    'compressor-3': [],
  },
  alerts: [],
  isConnected: false,
  stats: null,

  addTelemetryPoint: (payload) => {
    const { deviceId, value, timestamp, unit } = payload
    if (!deviceId) return

    set((state) => {
      const existing = state.telemetryData[deviceId] || []
      const point = {
        value: typeof value === 'number' ? value : parseFloat(value),
        timestamp: timestamp || new Date().toISOString(),
        time: new Date(timestamp || Date.now()).toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        unit: unit || '',
      }
      const updated = [...existing, point].slice(-MAX_POINTS)
      return {
        telemetryData: {
          ...state.telemetryData,
          [deviceId]: updated,
        },
      }
    })
  },

  addAlert: (alert) => {
    set((state) => ({
      alerts: [
        {
          ...alert,
          id: alert.id || alert._id || `${Date.now()}-${Math.random()}`,
          receivedAt: new Date().toISOString(),
        },
        ...state.alerts,
      ].slice(0, 100),
    }))
  },

  setConnected: (isConnected) => set({ isConnected }),

  fetchAlerts: async () => {
    try {
      const res = await axios.get('/api/alerts?limit=50')
      const data = res.data?.data || res.data || []
      set({ alerts: Array.isArray(data) ? data : [] })
    } catch (err) {
      console.error('fetchAlerts error:', err)
    }
  },

  fetchStats: async () => {
    try {
      const res = await axios.get('/api/telemetry/stats')
      const data = res.data?.data || res.data
      set({ stats: data })
      return data
    } catch (err) {
      console.error('fetchStats error:', err)
      return null
    }
  },
}))

export default useTelemetryStore
