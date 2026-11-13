import { Handle, Position } from 'reactflow'
import { Globe } from 'lucide-react'
import { useState } from 'react'

const SEVERITIES = ['info', 'warning', 'critical']

export default function WebhookTriggerNode({ data, selected }) {
  const [url, setUrl] = useState(data?.url || 'https://hooks.example.com/trigger')
  const [severity, setSeverity] = useState(data?.severity || 'warning')

  const handleUrlChange = (e) => {
    setUrl(e.target.value)
    if (data?.onChange) data.onChange({ url: e.target.value, severity })
  }

  const handleSeverityChange = (e) => {
    setSeverity(e.target.value)
    if (data?.onChange) data.onChange({ url, severity: e.target.value })
  }

  const severityColors = {
    info: 'text-sky-400',
    warning: 'text-yellow-400',
    critical: 'text-red-400',
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
          <Globe size={14} className="text-emerald-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-emerald-400 leading-none">Webhook Trigger</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Action Trigger</p>
        </div>
      </div>

      {/* Body */}
      <div className="px-3 py-3 space-y-2.5">
        <div>
          <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">
            Webhook URL
          </label>
          <input
            type="url"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://..."
            className="w-full text-xs rounded-lg px-2 py-1.5 outline-none border focus:border-emerald-500 transition-colors"
            style={{ background: '#0f1117', color: '#e2e8f0', borderColor: '#2a3550' }}
          />
        </div>

        <div>
          <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">
            Severity Level
          </label>
          <select
            value={severity}
            onChange={handleSeverityChange}
            className="w-full text-xs rounded-lg px-2 py-1.5 outline-none border focus:border-emerald-500 transition-colors"
            style={{ background: '#0f1117', color: '#e2e8f0', borderColor: '#2a3550' }}
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-md"
          style={{ background: 'rgba(16,185,129,0.08)' }}
        >
          <span className={`text-[10px] font-semibold ${severityColors[severity]}`}>
            {severity.toUpperCase()}
          </span>
          <span className="text-[10px] text-gray-500">— POST on trigger</span>
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
