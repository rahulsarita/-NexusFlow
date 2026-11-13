import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ReactFlowProvider } from 'reactflow'
import PipelineToolbar from '../components/pipeline/PipelineToolbar'
import NodePanel from '../components/pipeline/NodePanel'
import PipelineCanvas from '../components/pipeline/PipelineCanvas'
import usePipelineStore from '../store/usePipelineStore'

export default function PipelineEditor() {
  const { id } = useParams()
  const { loadPipeline, clearCanvas, setPipelineName } = usePipelineStore()

  useEffect(() => {
    if (id) {
      loadPipeline(id)
    } else {
      clearCanvas()
      setPipelineName('New Pipeline')
    }
  }, [id, loadPipeline, clearCanvas, setPipelineName])

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden select-none" style={{ backgroundColor: '#0f1117' }}>
      {/* Top Toolbar */}
      <PipelineToolbar />

      {/* Main Workspace: Left Node Library + Center/Right Canvas */}
      <div className="flex flex-1 overflow-hidden relative">
        <NodePanel />
        <main className="flex-1 h-full relative overflow-hidden">
          <ReactFlowProvider>
            <PipelineCanvas />
          </ReactFlowProvider>
        </main>
      </div>
    </div>
  )
}
