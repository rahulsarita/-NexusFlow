import { useEffect, useState } from 'react'
import { Wifi, WifiOff, Bell, RefreshCw } from 'lucide-react'
import clsx from 'clsx'
import useTelemetryStore from '../../store/useTelemetryStore'

export default function TopBar() {
  const { isConnected, alerts } = useTelemetryStore()
  const [currentTime, setCurrentTime] = useState(new Date())
  const unreadCount = alerts.filter((a) => !a.read).length

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header
      className="h-14 flex items-center justify-between px-6 border-b border-gray-700/60 shrink-0"
      style={{ backgroundColor: '#10151f' }}
    >
      {/* Left: breadcrumb / title area */}
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-gray-200">
          IoT Telemetry Dashboard
        </h1>
        <span className="text-gray-600 text-xs">
          {currentTime.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>

      {/* Right: status indicators */}
      <div className="flex items-center gap-4">
        {/* Live time */}
        <span className="font-mono text-xs text-gray-500">
          {currentTime.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </span>

        {/* Alert badge */}
        <div className="relative">
          <Bell size={18} className="text-gray-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-nexus-red text-white text-[9px] flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>

        {/* Connection status */}
        <div
          className={clsx(
            'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-500',
            isConnected
              ? 'bg-nexus-green/10 text-nexus-green border-nexus-green/30'
              : 'bg-gray-700/40 text-gray-500 border-gray-600/30'
          )}
        >
          {isConnected ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-nexus-green animate-pulse" />
              <Wifi size={12} />
              <span>Live</span>
            </>
          ) : (
            <>
              <WifiOff size={12} />
              <span>Disconnected</span>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
