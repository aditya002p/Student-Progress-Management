import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'
import { useThemeContext } from '@/context/ThemeContext'

export default function Layout() {
  const { theme } = useThemeContext()
  
  return (
    <div className={theme}>
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Header />
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  )
}
