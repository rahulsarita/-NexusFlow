import { Handle, Position } from 'reactflow'
import { Activity } from 'lucide-react'

export default function RateOfChangeNode({ data, selected }) {
  return (
    <div
      className="rounded-xl overflow-hidden min-w-[200px]"
      style={{
        background: '#1a2035',
        border: `2px solid ${selected ? '#8b5cf6' : '#3b1f7a'}`,
        boxShadow: selected ? '0 0 16px rgba(139,92,246,0.3)' : '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5"
        style={{ background: 'rgba(139,92,246,0.12)', borderBottom: '1px solid rgba(139,92,246,0.2)' }}
      >
        <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <Activity size={14} className="text-purple-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-purple-400 leading-none">Rate of Change</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Math Operation</p>
        </div>
      </div>

      {/* Body */}
      <div className="px-3 py-3 space-y-2">
        <div
          className="flex items-center justify-center px-2 py-2 rounded-md"
          style={{ background: 'rgba(139,92,246,0.08)' }}
        >
          <span className="text-sm font-mono font-bold text-purple-300">ΔValue / Δt</span>
        </div>
        <p className="text-[10px] text-gray-500 text-center leading-relaxed">
          Computes the rate of change between consecutive telemetry points
        </p>
        <div
          className="flex items-center justify-center px-2 py-1 rounded-md text-[10px] font-mono"
          style={{ background: 'rgba(0,0,0,0.3)', color: '#94a3b8' }}
        >
          (xₙ - xₙ₋₁) / (tₙ - tₙ₋₁)
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{ background: '#8b5cf6', borderColor: '#3b1f7a' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{ background: '#8b5cf6', borderColor: '#3b1f7a' }}
      />
    </div>
  )
}
