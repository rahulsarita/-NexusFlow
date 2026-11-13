import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart,
} from 'recharts'
import clsx from 'clsx'
import useTelemetryStore from '../../store/useTelemetryStore'

const DEVICES = [
  { id: 'turbine-1', label: 'Turbine #1', color: '#0ea5e9', unit: 'RPM' },
  { id: 'pump-2', label: 'Pump #2', color: '#8b5cf6', unit: 'bar' },
  { id: 'compressor-3', label: 'Compressor #3', color: '#10b981', unit: '°C' },
]

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="font-semibold font-mono" style={{ color: payload[0]?.color || '#0ea5e9' }}>
        {payload[0]?.value?.toFixed(2)} {unit}
      </p>
    </div>
  )
}

export default function TelemetryChart() {
  const [activeDevice, setActiveDevice] = useState('turbine-1')
  const telemetryData = useTelemetryStore((s) => s.telemetryData)

  const activeConfig = DEVICES.find((d) => d.id === activeDevice)
  const data = telemetryData[activeDevice] || []

  const { avg, min, max } = useMemo(() => {
    if (!data.length) return { avg: 0, min: 0, max: 0 }
    const values = data.map((d) => d.value)
    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    }
  }, [data])

  return (
    <div className="rounded-xl border border-gray-700/60 bg-gray-800/60 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700/60">
        <div className="flex items-center gap-3">
          <span
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ backgroundColor: activeConfig?.color }}
          />
          <h3 className="text-sm font-semibold text-gray-200">Live Telemetry</h3>
          <span className="text-xs text-gray-500">— Last {data.length} readings</span>
        </div>

        {/* Device tabs */}
        <div className="flex items-center gap-1 bg-gray-900/60 rounded-lg p-1">
          {DEVICES.map((device) => (
            <button
              key={device.id}
              onClick={() => setActiveDevice(device.id)}
              className={clsx(
                'px-3 py-1 rounded-md text-xs font-medium transition-all duration-200',
                activeDevice === device.id
                  ? 'bg-gray-700 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-300'
              )}
            >
              {device.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="px-4 pt-4 pb-2" style={{ height: 280 }}>
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center mx-auto mb-3">
                <span style={{ color: activeConfig?.color }} className="text-xl">~</span>
              </div>
              <p className="text-sm text-gray-500">Waiting for telemetry data...</p>
              <p className="text-xs text-gray-700 mt-1">Connect the backend server to begin streaming</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${activeDevice}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={activeConfig?.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={activeConfig?.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3550" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={45}
                tickFormatter={(v) => v.toFixed(1)}
              />
              <Tooltip
                content={<CustomTooltip unit={activeConfig?.unit} />}
                cursor={{ stroke: '#2a3550', strokeWidth: 1 }}
              />
              <ReferenceLine
                y={avg}
                stroke={activeConfig?.color}
                strokeDasharray="4 4"
                strokeOpacity={0.4}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={activeConfig?.color}
                strokeWidth={2}
                fill={`url(#gradient-${activeDevice})`}
                dot={false}
                activeDot={{ r: 4, fill: activeConfig?.color, strokeWidth: 0 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Stats footer */}
      {data.length > 0 && (
        <div className="flex items-center gap-6 px-5 py-3 border-t border-gray-700/40">
          {[
            { label: 'Min', value: min.toFixed(2) },
            { label: 'Avg', value: avg.toFixed(2) },
            { label: 'Max', value: max.toFixed(2) },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-xs text-gray-600">{label}</span>
              <span
                className="text-xs font-mono font-semibold"
                style={{ color: activeConfig?.color }}
              >
                {value} {activeConfig?.unit}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
