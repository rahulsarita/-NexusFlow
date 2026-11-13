import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, GitBranch } from 'lucide-react'
import DeviceStatusCard from '../components/dashboard/DeviceStatusCard'
import TelemetryChart from '../components/dashboard/TelemetryChart'
import AlertFeed from '../components/dashboard/AlertFeed'
import StatsPanel from '../components/dashboard/StatsPanel'
import useTelemetryStore from '../store/useTelemetryStore'
import usePipelineStore from '../store/usePipelineStore'

const DEVICES = ['turbine-1', 'pump-2', 'compressor-3']

export default function Dashboard() {
  const navigate = useNavigate()
  const { fetchAlerts } = useTelemetryStore()
  const { fetchPipelines } = usePipelineStore()

  useEffect(() => {
    fetchAlerts()
    fetchPipelines()
  }, [fetchAlerts, fetchPipelines])

  return (
    <div className="p-6 h-full flex flex-col gap-5 overflow-auto min-h-0">
      {/* Page header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white">Live Dashboard</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Real-time IoT telemetry monitoring across all connected devices
          </p>
        </div>
        <button
          onClick={() => navigate('/pipeline')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-nexus-blue/15 border border-nexus-blue/30 text-nexus-blue text-sm font-medium hover:bg-nexus-blue/25 transition-colors"
        >
          <Plus size={16} />
          New Pipeline
        </button>
      </div>

      {/* Device status row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        {DEVICES.map((deviceId) => (
          <DeviceStatusCard key={deviceId} deviceId={deviceId} />
        ))}
      </div>

      {/* Chart + Alert feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0" style={{ minHeight: 320 }}>
        {/* Chart (2/3 width) */}
        <div className="lg:col-span-2">
          <TelemetryChart />
        </div>

        {/* Alert feed (1/3 width) */}
        <div className="min-h-0 flex flex-col" style={{ maxHeight: 380 }}>
          <AlertFeed />
        </div>
      </div>

      {/* Stats panel */}
      <div className="shrink-0">
        <StatsPanel />
      </div>
    </div>
  )
}
