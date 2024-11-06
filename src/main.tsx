import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WagmiProvider } from 'wagmi'

import App from './App.tsx'
import { Toaster } from './components/ui/toaster.tsx'
import { DataProvider, ThemeProvider } from './context'
import { config } from './wagmi.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <ThemeProvider>
        <DataProvider>
          <Toaster />
          <App />
        </DataProvider>
      </ThemeProvider>
    </WagmiProvider>
  </StrictMode>
)
