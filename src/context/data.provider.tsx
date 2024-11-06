import { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

interface IDataProviderProps {
  children: ReactNode
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      refetchOnMount: true,
      refetchOnReconnect: false,
    },
  },
})

export const DataProvider: React.FunctionComponent<IDataProviderProps> = ({ children }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
