import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import { Toaster } from './components/ui/toaster.tsx'
import { DataProvider, ThemeProvider } from './context'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <DataProvider>
        <Toaster />
        <App />
      </DataProvider>
    </ThemeProvider>
  </StrictMode>
)
