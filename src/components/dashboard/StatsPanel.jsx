import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, BarChart2, RefreshCw } from 'lucide-react'
import clsx from 'clsx'
import useTelemetryStore from '../../store/useTelemetryStore'

const DEVICE_LABELS = {
  'turbine-1': 'Turbine #1',
  'pump-2': 'Pump #2',
  'compressor-3': 'Compressor #3',
}
const DEVICE_UNITS = {
  'turbine-1': 'RPM',
  'pump-2': 'bar',
  'compressor-3': '°C',
}
const DEVICE_COLORS = {
  'turbine-1': 'text-sky-400',
  'pump-2': 'text-purple-400',
  'compressor-3': 'text-emerald-400',
}

function StatCard({ label, value, unit, trend, color }) {
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus
  const trendColor = trend > 0 ? 'text-nexus-green' : trend < 0 ? 'text-nexus-red' : 'text-gray-500'

  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg bg-gray-900/50 border border-gray-700/40">
      <span className="text-xs text-gray-500">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className={clsx('text-lg font-bold font-mono', color)}>
          {value !== null ? value : '—'}
        </span>
        {unit && <span className="text-xs text-gray-600">{unit}</span>}
      </div>
      {trend !== null && (
        <div className={clsx('flex items-center gap-1 text-xs', trendColor)}>
          <TrendIcon size={11} />
          <span>{trend > 0 ? `+${trend}` : trend}</span>
        </div>
      )}
    </div>
  )
}

export default function StatsPanel() {
  const { telemetryData, stats, fetchStats } = useTelemetryStore()
  const [loading, setLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(null)

  const refresh = async () => {
    setLoading(true)
    await fetchStats()
    setLastRefresh(new Date())
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  // Compute local stats from store data as fallback
  const localStats = Object.entries(telemetryData).map(([deviceId, points]) => {
    if (!points.length) return { deviceId, min: null, max: null, avg: null, count: 0, trend: null }
    const values = points.map((p) => p.value)
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const trend =
      values.length >= 2
        ? parseFloat((values[values.length - 1] - values[values.length - 2]).toFixed(2))
        : null
    return {
      deviceId,
      min: Math.min(...values).toFixed(2),
      max: Math.max(...values).toFixed(2),
      avg: avg.toFixed(2),
      count: values.length,
      trend,
    }
  })

  const displayStats = stats || localStats

  return (
    <div className="rounded-xl border border-gray-700/60 bg-gray-800/60 backdrop-blur-sm">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700/60">
        <div className="flex items-center gap-2">
          <BarChart2 size={15} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-200">Device Statistics</h3>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={clsx(loading && 'animate-spin')} />
          {lastRefresh
            ? `Updated ${lastRefresh.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
            : 'Refresh'}
        </button>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {localStats.map(({ deviceId, min, max, avg, count, trend }) => (
          <div key={deviceId} className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className={clsx('text-xs font-semibold', DEVICE_COLORS[deviceId] || 'text-gray-400')}>
                {DEVICE_LABELS[deviceId] || deviceId}
              </span>
              <span className="text-xs text-gray-600 font-mono">{count} pts</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <StatCard
                label="Min"
                value={min}
                unit={DEVICE_UNITS[deviceId]}
                trend={null}
                color={DEVICE_COLORS[deviceId]}
              />
              <StatCard
                label="Avg"
                value={avg}
                unit={DEVICE_UNITS[deviceId]}
                trend={trend}
                color={DEVICE_COLORS[deviceId]}
              />
              <StatCard
                label="Max"
                value={max}
                unit={DEVICE_UNITS[deviceId]}
                trend={null}
                color={DEVICE_COLORS[deviceId]}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
