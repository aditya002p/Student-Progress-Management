import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/common/Layout/Layout'
import Dashboard from './pages/Dashboard/Dashboard'
import StudentsPage from './pages/Students/StudentsPage'
import StudentDetailPage from './pages/Students/StudentDetailPage'
import SettingsPage from './pages/Settings/SettingsPage'
import NotFound from './pages/NotFound/NotFound'
import './App.css'

function App() {
  const { user, isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading-spinner" />
      </div>
    )
  }

  return (
    <Routes>
      {user ? (
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="students/:id" element={<StudentDetailPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      ) : (
        <>
          {/* For simplified version, we'll just redirect to dashboard without auth */}
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="students/:id" element={<StudentDetailPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </>
      )}
    </Routes>
  )
}

export default App