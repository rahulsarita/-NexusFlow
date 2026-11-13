import { Radio, TrendingUp, Filter, Activity, Phone, Globe, Layers, GripVertical } from 'lucide-react'
import clsx from 'clsx'

const NODE_CATEGORIES = [
  {
    category: 'Data Sources',
    color: 'blue',
    accent: '#0ea5e9',
    nodes: [
      {
        type: 'sensorSource',
        label: 'Sensor Source',
        desc: 'Ingests stream from an IoT device',
        icon: Radio,
        colorClass: 'text-sky-400 bg-sky-500/10 border-sky-500/30 hover:border-sky-500/60',
      },
    ],
  },
  {
    category: 'Math Operations',
    color: 'purple',
    accent: '#8b5cf6',
    nodes: [
      {
        type: 'movingAverage',
        label: 'Moving Average',
        desc: 'Smooths noisy telemetry data',
        icon: TrendingUp,
        colorClass: 'text-purple-400 bg-purple-500/10 border-purple-500/30 hover:border-purple-500/60',
      },
      {
        type: 'threshold',
        label: 'Threshold Filter',
        desc: 'Filters data exceeding limit',
        icon: Filter,
        colorClass: 'text-purple-400 bg-purple-500/10 border-purple-500/30 hover:border-purple-500/60',
      },
      {
        type: 'rateOfChange',
        label: 'Rate of Change',
        desc: 'Detects sudden value spikes',
        icon: Activity,
        colorClass: 'text-purple-400 bg-purple-500/10 border-purple-500/30 hover:border-purple-500/60',
      },
    ],
  },
  {
    category: 'Action Triggers',
    color: 'green',
    accent: '#10b981',
    nodes: [
      {
        type: 'smsAlert',
        label: 'SMS Alert',
        desc: 'Dispatches mock SMS notification',
        icon: Phone,
        colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/60',
      },
      {
        type: 'webhookTrigger',
        label: 'Webhook Trigger',
        desc: 'Calls external HTTP endpoint',
        icon: Globe,
        colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/60',
      },
    ],
  },
]

export default function NodePanel() {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <aside
      className="w-72 shrink-0 border-r border-gray-700/60 flex flex-col h-full overflow-hidden select-none"
      style={{ backgroundColor: '#10151f' }}
    >
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-gray-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-nexus-blue" />
          <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
            Node Library
          </h3>
        </div>
        <span className="text-[10px] text-gray-500 bg-gray-800/80 px-2 py-0.5 rounded-full border border-gray-700/40">
          Drag to Canvas
        </span>
      </div>

      {/* Categories & Node items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NODE_CATEGORIES.map((cat) => (
          <div key={cat.category} className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: cat.accent }}
              />
              <span className="text-[11px] font-semibold text-gray-400 tracking-wider uppercase">
                {cat.category}
              </span>
            </div>

            <div className="space-y-2">
              {cat.nodes.map((node) => {
                const Icon = node.icon
                return (
                  <div
                    key={node.type}
                    onDragStart={(e) => onDragStart(e, node.type)}
                    draggable
                    className={clsx(
                      'group relative flex items-start gap-3 p-2.5 rounded-xl border transition-all duration-200 cursor-grab active:cursor-grabbing',
                      'bg-gray-800/40 hover:bg-gray-800/80 backdrop-blur-sm',
                      node.colorClass
                    )}
                  >
                    <div className="p-2 rounded-lg bg-gray-900/80 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-200 group-hover:text-white transition-colors">
                          {node.label}
                        </span>
                        <GripVertical
                          size={12}
                          className="text-gray-600 group-hover:text-gray-400 transition-colors"
                        />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">
                        {node.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Tip footer */}
      <div className="p-3 border-t border-gray-700/60 bg-gray-900/40">
        <p className="text-[10px] text-gray-500 text-center leading-relaxed">
          💡 Connect <span className="text-sky-400 font-medium">Source</span> → <span className="text-purple-400 font-medium">Ops</span> → <span className="text-emerald-400 font-medium">Action</span> to form an active rule pipeline
        </p>
      </div>
    </aside>
  )
}
