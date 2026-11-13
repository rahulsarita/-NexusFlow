import { create } from 'zustand'
import axios from 'axios'

const usePipelineStore = create((set, get) => ({
  pipelines: [],
  currentPipeline: null,
  nodes: [],
  edges: [],
  isDirty: false,
  pipelineName: 'Untitled Pipeline',

  setPipelineName: (name) => set({ pipelineName: name, isDirty: true }),

  setNodes: (nodes) => {
    const resolved = typeof nodes === 'function' ? nodes(get().nodes) : nodes
    set({ nodes: resolved, isDirty: true })
  },

  setEdges: (edges) => {
    const resolved = typeof edges === 'function' ? edges(get().edges) : edges
    set({ edges: resolved, isDirty: true })
  },

  fetchPipelines: async () => {
    try {
      const res = await axios.get('/api/pipelines')
      const data = res.data?.data || res.data || []
      set({ pipelines: Array.isArray(data) ? data : [] })
      return data
    } catch (err) {
      console.error('fetchPipelines error:', err)
      return []
    }
  },

  loadPipeline: async (id) => {
    try {
      const res = await axios.get(`/api/pipelines/${id}`)
      const data = res.data?.data || res.data
      if (data) {
        set({
          currentPipeline: data,
          nodes: data.nodes || [],
          edges: data.edges || [],
          pipelineName: data.name || 'Untitled Pipeline',
          isDirty: false,
        })
      }
      return data
    } catch (err) {
      console.error('loadPipeline error:', err)
      return null
    }
  },

  savePipeline: async () => {
    const { currentPipeline, nodes, edges, pipelineName } = get()
    try {
      const payload = { name: pipelineName, nodes, edges }
      let data
      if (currentPipeline?._id) {
        const res = await axios.put(`/api/pipelines/${currentPipeline._id}`, payload)
        data = res.data?.data || res.data
      } else {
        const res = await axios.post('/api/pipelines', payload)
        data = res.data?.data || res.data
      }
      set({ currentPipeline: data, isDirty: false })
      get().fetchPipelines()
      return data
    } catch (err) {
      console.error('savePipeline error:', err)
      throw err
    }
  },

  activatePipeline: async (id) => {
    try {
      // Backend supports POST /api/pipelines/:id/activate
      const res = await axios.post(`/api/pipelines/${id}/activate`)
      const data = res.data?.data || res.data
      set((state) => ({
        pipelines: state.pipelines.map((p) => (p._id === id ? { ...p, isActive: true } : p)),
        currentPipeline: state.currentPipeline?._id === id ? { ...state.currentPipeline, isActive: true } : state.currentPipeline,
      }))
      return data
    } catch (err) {
      console.error('activatePipeline error:', err)
      throw err
    }
  },

  deactivatePipeline: async (id) => {
    try {
      // Backend supports POST /api/pipelines/:id/deactivate
      const res = await axios.post(`/api/pipelines/${id}/deactivate`)
      const data = res.data?.data || res.data
      set((state) => ({
        pipelines: state.pipelines.map((p) => (p._id === id ? { ...p, isActive: false } : p)),
        currentPipeline: state.currentPipeline?._id === id ? { ...state.currentPipeline, isActive: false } : state.currentPipeline,
      }))
      return data
    } catch (err) {
      console.error('deactivatePipeline error:', err)
      throw err
    }
  },

  clearCanvas: () => set({ nodes: [], edges: [], isDirty: true }),
}))

export default usePipelineStore
