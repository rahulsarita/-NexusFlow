import { Handle, Position } from 'reactflow'
import { Filter } from 'lucide-react'
import { useState } from 'react'

const OPERATORS = ['>', '<', '>=', '<=', '==', '!=']

export default function ThresholdNode({ data, selected }) {
  const [threshold, setThreshold] = useState(data?.threshold ?? 100)
  const [operator, setOperator] = useState(data?.operator || '>')

  const handleThresholdChange = (e) => {
    const val = parseFloat(e.target.value) || 0
    setThreshold(val)
    if (data?.onChange) data.onChange({ threshold: val, operator })
  }

  const handleOperatorChange = (e) => {
    const val = e.target.value
    setOperator(val)
    if (data?.onChange) data.onChange({ threshold, operator: val })
  }

  return (
    <div
      className="rounded-xl overflow-hidden min-w-[210px]"
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
          <Filter size={14} className="text-purple-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-purple-400 leading-none">Threshold Filter</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Math Operation</p>
        </div>
      </div>

      {/* Body */}
      <div className="px-3 py-3 space-y-2.5">
        <div>
          <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">
            Operator
          </label>
          <select
            value={operator}
            onChange={handleOperatorChange}
            className="w-full text-xs rounded-lg px-2 py-1.5 outline-none border focus:border-purple-500 transition-colors"
            style={{ background: '#0f1117', color: '#e2e8f0', borderColor: '#2a3550' }}
          >
            {OPERATORS.map((op) => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">
            Threshold Value
          </label>
          <input
            type="number"
            value={threshold}
            onChange={handleThresholdChange}
            className="w-full text-xs rounded-lg px-2 py-1.5 outline-none border focus:border-purple-500 transition-colors"
            style={{ background: '#0f1117', color: '#e2e8f0', borderColor: '#2a3550' }}
          />
        </div>

        <div
          className="flex items-center justify-center px-2 py-1.5 rounded-md"
          style={{ background: 'rgba(139,92,246,0.08)' }}
        >
          <span className="text-[11px] font-mono text-purple-300">
            value {operator} {threshold}
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
