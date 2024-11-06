import { ThemeProvider } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen bg-background text-foreground">
        <Button>Hello</Button>
      </div>
    </ThemeProvider>
  )
}
