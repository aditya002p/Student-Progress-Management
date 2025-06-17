import { NavLink } from 'react-router-dom'
import { BarChart3, Users, Settings } from 'lucide-react'

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
      <div className="p-4 font-semibold text-xl flex items-center gap-2">
        <BarChart3 className="h-6 w-6" />
        <span>SPM System</span>
      </div>
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`
              }
              end
            >
              <BarChart3 className="w-5 h-5" />
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/students"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`
              }
            >
              <Users className="w-5 h-5" />
              Students
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`
              }
            >
              <Settings className="w-5 h-5" />
              Settings
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  )
}
