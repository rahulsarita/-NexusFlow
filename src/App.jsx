import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import Dashboard from './pages/Dashboard'
import PipelineEditor from './pages/PipelineEditor'
import { useWebSocket } from './hooks/useWebSocket'

function AppLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#0f1117' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

function AppRoutes() {
  useWebSocket()

  return (
    <Routes>
      <Route path="/" element={
        <AppLayout>
          <Dashboard />
        </AppLayout>
      } />
      <Route path="/pipeline/:id?" element={<PipelineEditor />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a2035',
            color: '#e2e8f0',
            border: '1px solid #2a3550',
            borderRadius: '10px',
            fontSize: '0.875rem',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#0f1117' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#0f1117' },
          },
        }}
      />
    </BrowserRouter>
  )
}
