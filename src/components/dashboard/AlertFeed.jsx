import { useMemo } from 'react'
import { formatDistanceToNow } from '../../utils/timeFormat'
import Badge from '../ui/Badge'
import useTelemetryStore from '../../store/useTelemetryStore'
import { Bell, AlertTriangle, Info } from 'lucide-react'
import clsx from 'clsx'

const SEVERITY_ICON = {
  critical: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
}

const SEVERITY_BADGE = {
  critical: 'critical',
  warning: 'warning',
  info: 'info',
}

function AlertItem({ alert, isNew }) {
  const Icon = SEVERITY_ICON[alert.severity] || Info
  const timeAgo = formatDistanceToNow(new Date(alert.triggeredAt || alert.receivedAt || Date.now()))

  return (
    <div
      className={clsx(
        'flex items-start gap-3 px-4 py-3 border-b border-gray-700/40 last:border-b-0 transition-all',
        'hover:bg-gray-700/20',
        isNew && 'animate-fade-in'
      )}
    >
      {/* Severity icon */}
      <div
        className={clsx(
          'mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0',
          alert.severity === 'critical'
            ? 'bg-red-500/15'
            : alert.severity === 'warning'
            ? 'bg-yellow-500/15'
            : 'bg-sky-500/15'
        )}
      >
        <Icon
          size={13}
          className={
            alert.severity === 'critical'
              ? 'text-nexus-red'
              : alert.severity === 'warning'
              ? 'text-yellow-400'
              : 'text-nexus-blue'
          }
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <Badge variant={SEVERITY_BADGE[alert.severity] || 'info'}>
            {alert.severity || 'info'}
          </Badge>
          <span className="text-xs text-gray-500 font-mono">{alert.deviceId || 'unknown'}</span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">
          {alert.message || 'Threshold condition triggered'}
        </p>
        {alert.value !== undefined && (
          <p className="text-xs text-gray-600 mt-0.5 font-mono">
            Value: {typeof alert.value === 'number' ? alert.value.toFixed(2) : alert.value}
            {alert.threshold !== undefined && ` / Threshold: ${alert.threshold}`}
          </p>
        )}
      </div>

      {/* Time */}
      <span className="text-xs text-gray-600 shrink-0 mt-0.5">{timeAgo}</span>
    </div>
  )
}

export default function AlertFeed() {
  const alerts = useTelemetryStore((s) => s.alerts)
  const displayAlerts = useMemo(() => alerts.slice(0, 20), [alerts])

  return (
    <div className="rounded-xl border border-gray-700/60 bg-gray-800/60 backdrop-blur-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/60 shrink-0">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-200">Alert Feed</h3>
        </div>
        <div className="flex items-center gap-2">
          {alerts.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-nexus-red/20 text-nexus-red text-xs font-bold flex items-center justify-center">
              {Math.min(alerts.length, 99)}
            </span>
          )}
        </div>
      </div>

      {/* Alert list */}
      <div className="flex-1 overflow-y-auto">
        {displayAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-gray-700/40 flex items-center justify-center mb-3">
              <Bell size={20} className="text-gray-600" />
            </div>
            <p className="text-sm text-gray-500">No alerts yet</p>
            <p className="text-xs text-gray-700 mt-1">Alerts will appear here in real-time</p>
          </div>
        ) : (
          displayAlerts.map((alert, idx) => (
            <AlertItem
              key={alert.id || `${alert.triggeredAt}-${idx}`}
              alert={alert}
              isNew={idx === 0}
            />
          ))
        )}
      </div>
    </div>
  )
}
