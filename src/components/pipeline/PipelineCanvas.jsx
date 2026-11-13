import { useCallback, useRef, useMemo } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'

import SensorSourceNode from './nodes/SensorSourceNode'
import MovingAverageNode from './nodes/MovingAverageNode'
import ThresholdNode from './nodes/ThresholdNode'
import RateOfChangeNode from './nodes/RateOfChangeNode'
import SmsAlertNode from './nodes/SmsAlertNode'
import WebhookTriggerNode from './nodes/WebhookTriggerNode'
import usePipelineStore from '../../store/usePipelineStore'

const nodeTypes = {
  sensorSource: SensorSourceNode,
  movingAverage: MovingAverageNode,
  threshold: ThresholdNode,
  rateOfChange: RateOfChangeNode,
  smsAlert: SmsAlertNode,
  webhookTrigger: WebhookTriggerNode,
}

const defaultEdgeOptions = {
  animated: true,
  style: {
    stroke: '#0ea5e9',
    strokeWidth: 2,
  },
}

let idCounter = 1
const getId = (type) => `${type}_${Date.now()}_${idCounter++}`

export default function PipelineCanvas() {
  const reactFlowWrapper = useRef(null)
  const { project, screenToFlowPosition } = useReactFlow()
  const { nodes, edges, setNodes, setEdges } = usePipelineStore()

  // Handle node changes (position, selection, removal)
  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds))
    },
    [setNodes]
  )

  // Handle edge changes (selection, removal)
  const onEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => applyEdgeChanges(changes, eds))
    },
    [setEdges]
  )

  // Handle new connection between handles
  const onConnect = useCallback(
    (params) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: '#0ea5e9', strokeWidth: 2 },
          },
          eds
        )
      )
    },
    [setEdges]
  )

  // Drag over canvas
  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  // Drop node onto canvas
  const onDrop = useCallback(
    (event) => {
      event.preventDefault()
      const type = event.dataTransfer.getData('application/reactflow')
      if (!type) return

      const bounds = reactFlowWrapper.current.getBoundingClientRect()
      let position
      if (typeof screenToFlowPosition === 'function') {
        position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
      } else {
        position = project({
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        })
      }

      // Default data per node type
      const defaultDataByType = {
        sensorSource: { deviceId: 'turbine-1' },
        movingAverage: { windowSize: 5 },
        threshold: { threshold: 80, operator: '>' },
        rateOfChange: {},
        smsAlert: { phone: '+1-555-0100', template: 'Alert: {deviceId} exceeded threshold!' },
        webhookTrigger: { url: 'https://hooks.example.com/trigger', severity: 'warning' },
      }

      const newNodeId = getId(type)
      const newNode = {
        id: newNodeId,
        type,
        position,
        data: {
          ...(defaultDataByType[type] || {}),
          onChange: (newData) => {
            setNodes((nds) =>
              nds.map((n) =>
                n.id === newNodeId
                  ? { ...n, data: { ...n.data, ...newData } }
                  : n
              )
            )
          },
        },
      }

      setNodes((nds) => [...nds, newNode])
    },
    [project, screenToFlowPosition, setNodes]
  )

  // Ensure nodes in store have onChange wired up
  const decoratedNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onChange: (newData) => {
          setNodes((nds) =>
            nds.map((n) =>
              n.id === node.id
                ? { ...n, data: { ...n.data, ...newData } }
                : n
            )
          )
        },
      },
    }))
  }, [nodes, setNodes])

  return (
    <div ref={reactFlowWrapper} className="w-full h-full relative" style={{ backgroundColor: '#0f1117' }}>
      <ReactFlow
        nodes={decoratedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={18}
          size={1.5}
          color="#2a3550"
        />
        <Controls
          showInteractive={false}
          className="m-4"
        />
        <MiniMap
          nodeStrokeColor="#0ea5e9"
          nodeColor="#1a2035"
          nodeBorderRadius={4}
          maskColor="rgba(15, 17, 23, 0.7)"
          className="m-4"
        />
      </ReactFlow>

      {/* Empty State Overlay */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-center p-6 select-none">
          <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-700/60 max-w-sm backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-nexus-blue/15 border border-nexus-blue/30 text-nexus-blue flex items-center justify-center mx-auto mb-3">
              ✦
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Canvas is Empty</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Drag node blocks from the left panel onto this canvas, then link handles to assemble your live telemetry rule pipeline.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
