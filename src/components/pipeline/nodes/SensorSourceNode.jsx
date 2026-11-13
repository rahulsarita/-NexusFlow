import { Handle, Position } from 'reactflow'
import { Radio } from 'lucide-react'
import { useState } from 'react'

const DEVICES = ['turbine-1', 'pump-2', 'compressor-3']

export default function SensorSourceNode({ data, selected }) {
  const [deviceId, setDeviceId] = useState(data?.deviceId || 'turbine-1')

  const handleChange = (e) => {
    const val = e.target.value
    setDeviceId(val)
    if (data?.onChange) data.onChange({ deviceId: val })
  }

  return (
    <div
      className="rounded-xl overflow-hidden min-w-[200px]"
      style={{
        background: '#1a2035',
        border: `2px solid ${selected ? '#0ea5e9' : '#1e3a5f'}`,
        boxShadow: selected ? '0 0 16px rgba(14,165,233,0.3)' : '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5"
        style={{ background: 'rgba(14,165,233,0.12)', borderBottom: '1px solid rgba(14,165,233,0.2)' }}
      >
        <div className="w-7 h-7 rounded-lg bg-sky-500/20 flex items-center justify-center">
          <Radio size={14} className="text-sky-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-sky-400 leading-none">Sensor Source</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Data Input</p>
        </div>
      </div>

      {/* Body */}
      <div className="px-3 py-3 space-y-2">
        <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">
          Device ID
        </label>
        <select
          value={deviceId}
          onChange={handleChange}
          className="w-full text-xs rounded-lg px-2 py-1.5 outline-none border focus:border-sky-500 transition-colors"
          style={{
            background: '#0f1117',
            color: '#e2e8f0',
            borderColor: '#2a3550',
          }}
        >
          {DEVICES.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-md mt-1"
          style={{ background: 'rgba(14,165,233,0.08)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          <span className="text-[10px] text-sky-400 font-mono">{deviceId}</span>
        </div>
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{ background: '#0ea5e9', borderColor: '#1e3a5f' }}
      />
    </div>
  )
}
