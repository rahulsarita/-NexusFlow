import { Handle, Position } from 'reactflow'
import { TrendingUp } from 'lucide-react'
import { useState } from 'react'

export default function MovingAverageNode({ data, selected }) {
  const [windowSize, setWindowSize] = useState(data?.windowSize || 5)

  const handleChange = (e) => {
    const val = Math.max(1, parseInt(e.target.value) || 1)
    setWindowSize(val)
    if (data?.onChange) data.onChange({ windowSize: val })
  }

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
          <TrendingUp size={14} className="text-purple-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-purple-400 leading-none">Moving Average</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Math Operation</p>
        </div>
      </div>

      {/* Body */}
      <div className="px-3 py-3 space-y-2">
        <label className="block text-[10px] text-gray-500 uppercase tracking-wider">
          Window Size (N)
        </label>
        <input
          type="number"
          min="1"
          max="100"
          value={windowSize}
          onChange={handleChange}
          className="w-full text-xs rounded-lg px-2 py-1.5 outline-none border focus:border-purple-500 transition-colors"
          style={{ background: '#0f1117', color: '#e2e8f0', borderColor: '#2a3550' }}
        />
        <div
          className="flex items-center justify-center px-2 py-1.5 rounded-md"
          style={{ background: 'rgba(139,92,246,0.08)' }}
        >
          <span className="text-[11px] font-mono text-purple-300">
            SMA(N={windowSize}) = Σxᵢ / N
          </span>
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
