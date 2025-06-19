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
  useAuth();
  
  

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="students/new" element={<StudentsPage />} />
        <Route path="students/:id" element={<StudentDetailPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App