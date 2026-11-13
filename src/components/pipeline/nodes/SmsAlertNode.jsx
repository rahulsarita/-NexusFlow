import { Handle, Position } from 'reactflow'
import { Phone } from 'lucide-react'
import { useState } from 'react'

export default function SmsAlertNode({ data, selected }) {
  const [phone, setPhone] = useState(data?.phone || '+1-555-0100')
  const [template, setTemplate] = useState(data?.template || 'Alert: {deviceId} value {value} exceeded threshold!')

  const handlePhoneChange = (e) => {
    setPhone(e.target.value)
    if (data?.onChange) data.onChange({ phone: e.target.value, template })
  }

  const handleTemplateChange = (e) => {
    setTemplate(e.target.value)
    if (data?.onChange) data.onChange({ phone, template: e.target.value })
  }

  return (
    <div
      className="rounded-xl overflow-hidden min-w-[220px]"
      style={{
        background: '#1a2035',
        border: `2px solid ${selected ? '#10b981' : '#064e3b'}`,
        boxShadow: selected ? '0 0 16px rgba(16,185,129,0.3)' : '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5"
        style={{ background: 'rgba(16,185,129,0.12)', borderBottom: '1px solid rgba(16,185,129,0.2)' }}
      >
        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <Phone size={14} className="text-emerald-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-emerald-400 leading-none">SMS Alert</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Action Trigger</p>
        </div>
      </div>

      {/* Body */}
      <div className="px-3 py-3 space-y-2.5">
        <div>
          <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">
            Phone Number
          </label>
          <input
            type="text"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="+1-555-0100"
            className="w-full text-xs rounded-lg px-2 py-1.5 outline-none border focus:border-emerald-500 transition-colors"
            style={{ background: '#0f1117', color: '#e2e8f0', borderColor: '#2a3550' }}
          />
        </div>

        <div>
          <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">
            Message Template
          </label>
          <textarea
            value={template}
            onChange={handleTemplateChange}
            rows={2}
            className="w-full text-xs rounded-lg px-2 py-1.5 outline-none border focus:border-emerald-500 transition-colors resize-none"
            style={{ background: '#0f1117', color: '#e2e8f0', borderColor: '#2a3550' }}
          />
          <p className="text-[9px] text-gray-600 mt-0.5">Use {'{deviceId}'}, {'{value}'}, {'{threshold}'}</p>
        </div>

        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-md"
          style={{ background: 'rgba(16,185,129,0.08)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-emerald-400">Mock SMS — no real messages sent</span>
        </div>
      </div>

      {/* Input handle only (sink) */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{ background: '#10b981', borderColor: '#064e3b' }}
      />
    </div>
  )
}
