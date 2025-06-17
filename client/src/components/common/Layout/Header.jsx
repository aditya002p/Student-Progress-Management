import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import ThemeToggle from '@/components/common/ThemeToggle'
import { Button } from '@/components/common/UI/Button'
import { useAuth } from '@/hooks/useAuth'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  
  return (
    <header className="bg-background border-b border-border sticky top-0 z-30">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <Link to="/" className="font-semibold text-lg md:text-xl">
          Student Progress Management
        </Link>
        
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          
          {user && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium hidden md:block">
                {user.name}
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={logout}
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t border-border p-4">
          <nav className="space-y-3">
            <Link 
              to="/" 
              className="block px-2 py-1 rounded hover:bg-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/students" 
              className="block px-2 py-1 rounded hover:bg-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              Students
            </Link>
            <Link 
              to="/settings" 
              className="block px-2 py-1 rounded hover:bg-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              Settings
            </Link>
            
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <ThemeToggle />
                
                {user && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={logout}
                  >
                    Logout
                  </Button>
                )}
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
