import { useMemo } from 'react'
import clsx from 'clsx'
import { Cpu, Zap, Wind } from 'lucide-react'
import useTelemetryStore from '../../store/useTelemetryStore'

const DEVICE_CONFIG = {
  'turbine-1': { label: 'Turbine #1', icon: Wind, unit: 'RPM', color: 'nexus-blue', accent: '#0ea5e9' },
  'pump-2': { label: 'Pump #2', icon: Zap, unit: 'bar', color: 'nexus-purple', accent: '#8b5cf6' },
  'compressor-3': { label: 'Compressor #3', icon: Cpu, unit: '°C', color: 'nexus-green', accent: '#10b981' },
}

const STALE_THRESHOLD_MS = 5000

function DeviceStatusCard({ deviceId }) {
  const telemetryData = useTelemetryStore((s) => s.telemetryData[deviceId] || [])
  const config = DEVICE_CONFIG[deviceId] || { label: deviceId, icon: Cpu, unit: '', color: 'nexus-blue', accent: '#0ea5e9' }
  const Icon = config.icon

  const { latestPoint, isOnline, delta } = useMemo(() => {
    if (!telemetryData.length) return { latestPoint: null, isOnline: false, delta: null }

    const latest = telemetryData[telemetryData.length - 1]
    const latestTime = new Date(latest.timestamp).getTime()
    const online = Date.now() - latestTime < STALE_THRESHOLD_MS

    let deltaVal = null
    if (telemetryData.length >= 2) {
      const prev = telemetryData[telemetryData.length - 2]
      deltaVal = (latest.value - prev.value).toFixed(2)
    }

    return { latestPoint: latest, isOnline: online, delta: deltaVal }
  }, [telemetryData])

  const colorBorder = {
    'nexus-blue': 'border-sky-500/30',
    'nexus-purple': 'border-purple-500/30',
    'nexus-green': 'border-emerald-500/30',
  }

  const colorBg = {
    'nexus-blue': 'from-sky-500/10 to-transparent',
    'nexus-purple': 'from-purple-500/10 to-transparent',
    'nexus-green': 'from-emerald-500/10 to-transparent',
  }

  const colorText = {
    'nexus-blue': 'text-sky-400',
    'nexus-purple': 'text-purple-400',
    'nexus-green': 'text-emerald-400',
  }

  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-xl border p-5 transition-all duration-300 hover:scale-[1.01]',
        'bg-gray-800/60 backdrop-blur-sm',
        colorBorder[config.color] || 'border-gray-700/60'
      )}
    >
      {/* Background gradient */}
      <div
        className={clsx(
          'absolute inset-0 bg-gradient-to-br opacity-50 pointer-events-none',
          colorBg[config.color]
        )}
      />

      {/* Top row */}
      <div className="relative flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
            {config.label}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className={clsx('text-3xl font-bold font-mono tracking-tight', colorText[config.color])}>
              {latestPoint ? latestPoint.value.toFixed(1) : '—'}
            </span>
            <span className="text-sm text-gray-500">{config.unit}</span>
          </div>
        </div>

        {/* Icon */}
        <div
          className={clsx('p-2.5 rounded-lg', `bg-${config.color}/10`)}
          style={{ backgroundColor: `${config.accent}18` }}
        >
          <Icon size={22} style={{ color: config.accent }} />
        </div>
      </div>

      {/* Status + delta */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={clsx(
              'w-2 h-2 rounded-full',
              isOnline
                ? 'bg-nexus-green animate-pulse'
                : 'bg-gray-600'
            )}
          />
          <span
            className={clsx(
              'text-xs font-medium',
              isOnline ? 'text-nexus-green' : 'text-gray-500'
            )}
          >
            {isOnline ? 'Online' : telemetryData.length ? 'Stale' : 'No Data'}
          </span>
        </div>

        {delta !== null && (
          <span
            className={clsx(
              'text-xs font-mono font-medium',
              parseFloat(delta) > 0 ? 'text-nexus-green' : parseFloat(delta) < 0 ? 'text-nexus-red' : 'text-gray-500'
            )}
          >
            {parseFloat(delta) > 0 ? '+' : ''}{delta} {config.unit}
          </span>
        )}
      </div>

      {/* Reading count */}
      <div className="relative mt-3 pt-3 border-t border-gray-700/40">
        <p className="text-xs text-gray-600">
          {telemetryData.length} readings collected
        </p>
      </div>
    </div>
  )
}

export default DeviceStatusCard
