import { useThemeContext } from '@/context/ThemeContext'
import { Moon, Sun } from 'lucide-react'
import { Button } from '../../ui/button'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeContext()
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="w-9 h-9 rounded-full"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  )
}
