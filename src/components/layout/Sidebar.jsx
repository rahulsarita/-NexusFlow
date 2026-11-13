import { useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, GitBranch, Zap, Settings, Activity, ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import usePipelineStore from '../../store/usePipelineStore'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/pipeline', icon: GitBranch, label: 'Pipeline Editor' },
]

function NavItem({ to, icon: Icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
          isActive
            ? 'bg-nexus-blue/15 text-nexus-blue border border-nexus-blue/30 shadow-sm shadow-nexus-blue/20'
            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
        )
      }
    >
      <Icon size={18} className="shrink-0" />
      <span className="flex-1">{label}</span>
      <ChevronRight size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />
    </NavLink>
  )
}

function PipelineList() {
  const { pipelines, fetchPipelines } = usePipelineStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchPipelines()
  }, [fetchPipelines])

  if (!pipelines || !pipelines.length) {
    return (
      <p className="text-xs text-gray-600 px-2 py-1">No pipelines yet</p>
    )
  }

  return (
    <div className="space-y-1">
      {pipelines.slice(0, 8).map((pipeline) => (
        <button
          key={pipeline._id}
          onClick={() => navigate(`/pipeline/${pipeline._id}`)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-700/40 transition-all group text-left"
        >
          <span
            className={clsx(
              'w-1.5 h-1.5 rounded-full shrink-0',
              pipeline.isActive ? 'bg-nexus-green animate-pulse' : 'bg-gray-600'
            )}
          />
          <span className="truncate flex-1">{pipeline.name}</span>
          <Zap
            size={11}
            className={clsx(
              'shrink-0 opacity-0 group-hover:opacity-100 transition-opacity',
              pipeline.isActive ? 'text-nexus-green' : 'text-gray-500'
            )}
          />
        </button>
      ))}
    </div>
  )
}

export default function Sidebar() {
  const navigate = useNavigate()

  return (
    <aside
      className="w-60 shrink-0 flex flex-col border-r border-gray-700/60"
      style={{ backgroundColor: '#10151f' }}
    >
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-700/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-nexus-blue to-nexus-purple flex items-center justify-center shadow-lg shadow-nexus-blue/30">
            <Activity size={16} className="text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-sm tracking-wide">NexusFlow</span>
            <p className="text-gray-500 text-xs">IoT Telemetry Engine</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-2 mb-2">
          Navigation
        </p>
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        {/* Pipelines list */}
        <div className="mt-5">
          <div className="flex items-center justify-between px-2 mb-2">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Pipelines
            </p>
            <button
              onClick={() => navigate('/pipeline')}
              className="text-xs text-nexus-blue hover:text-nexus-blue/80 font-medium transition-colors"
            >
              + New
            </button>
          </div>
          <PipelineList />
        </div>
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-700/60">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-300 hover:bg-gray-700/40 cursor-pointer transition-colors">
          <Settings size={16} />
          <span>Settings</span>
        </div>
        <p className="text-xs text-gray-700 text-center mt-3">NexusFlow v0.0.1</p>
      </div>
    </aside>
  )
}
