import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Play, Square, Trash2, Check, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import usePipelineStore from '../../store/usePipelineStore'

export default function PipelineToolbar() {
  const navigate = useNavigate()
  const {
    pipelineName,
    setPipelineName,
    currentPipeline,
    savePipeline,
    activatePipeline,
    deactivatePipeline,
    clearCanvas,
    isDirty,
    nodes,
  } = usePipelineStore()

  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState(false)

  const isActive = currentPipeline?.isActive || false

  const handleSave = async () => {
    if (!pipelineName.trim()) {
      toast.error('Pipeline name cannot be empty')
      return
    }
    setSaving(true)
    try {
      await savePipeline()
      toast.success('Pipeline saved successfully')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save pipeline')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async () => {
    if (!currentPipeline?._id) {
      toast.error('Please save the pipeline before activating')
      return
    }
    if (nodes.length === 0) {
      toast.error('Add nodes before activating the pipeline')
      return
    }
    setToggling(true)
    try {
      if (isActive) {
        await deactivatePipeline(currentPipeline._id)
        toast('Pipeline deactivated', { icon: '⏹️' })
      } else {
        await activatePipeline(currentPipeline._id)
        toast.success('Pipeline activated and stream compiled!')
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to toggle pipeline state')
    } finally {
      setToggling(false)
    }
  }

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all nodes and edges from canvas?')) {
      clearCanvas()
      toast('Canvas cleared', { icon: '🗑️' })
    }
  }

  return (
    <header
      className="h-14 flex items-center justify-between px-4 border-b border-gray-700/60 shrink-0 select-none z-10"
      style={{ backgroundColor: '#10151f' }}
    >
      {/* Left: Back + Name input */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          title="Back to Dashboard"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline font-medium">Dashboard</span>
        </button>

        <div className="h-5 w-px bg-gray-700/60" />

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={pipelineName}
            onChange={(e) => setPipelineName(e.target.value)}
            placeholder="Pipeline Name..."
            className="text-sm font-semibold text-white bg-transparent hover:bg-gray-800/60 focus:bg-gray-800 px-2.5 py-1 rounded-md outline-none border border-transparent focus:border-nexus-blue/60 transition-all w-52 sm:w-64"
          />
          {isDirty && (
            <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" title="Unsaved changes" />
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Status indicator */}
        <div
          className={clsx(
            'hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border',
            isActive
              ? 'bg-nexus-green/10 text-nexus-green border-nexus-green/30'
              : 'bg-gray-800/80 text-gray-400 border-gray-700/60'
          )}
        >
          <span
            className={clsx(
              'w-2 h-2 rounded-full',
              isActive ? 'bg-nexus-green animate-pulse' : 'bg-gray-500'
            )}
          />
          <span>{isActive ? 'Active Stream' : 'Inactive'}</span>
        </div>

        {/* Clear Button */}
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-nexus-red hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
          title="Clear canvas"
        >
          <Trash2 size={14} />
          <span className="hidden sm:inline">Clear</span>
        </button>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-gray-800 hover:bg-gray-700 text-white border border-gray-600/60 transition-all disabled:opacity-50"
        >
          <Save size={14} className={clsx(saving && 'animate-spin')} />
          <span>{saving ? 'Saving...' : 'Save'}</span>
        </button>

        {/* Activate / Deactivate Toggle Button */}
        <button
          onClick={handleToggleActive}
          disabled={toggling}
          className={clsx(
            'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50',
            isActive
              ? 'bg-nexus-red/15 hover:bg-nexus-red/25 text-nexus-red border border-nexus-red/30'
              : 'bg-nexus-green/15 hover:bg-nexus-green/25 text-nexus-green border border-nexus-green/30'
          )}
        >
          {isActive ? (
            <>
              <Square size={14} />
              <span>{toggling ? 'Stopping...' : 'Deactivate'}</span>
            </>
          ) : (
            <>
              <Play size={14} />
              <span>{toggling ? 'Starting...' : 'Activate'}</span>
            </>
          )}
        </button>
      </div>
    </header>
  )
}
