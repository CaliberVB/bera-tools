import { useAccount } from 'wagmi'

import { ConnectWallet } from '@/components/ConnectWallet'
import { Header } from '@/components/Header'
import { ListVaultForm } from '@/components/ListVaultForm'
import { Spinner } from '@/components/ui/spinner'
import { useListVault } from '@/data'

const App = () => {
  const { data: vaults, isLoading } = useListVault()
  const { isConnected } = useAccount()

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="container max-w-xl mx-auto py-6">
      <Header />

      {!isConnected ? (
        <ConnectWallet />
      ) : (
        <ListVaultForm vaults={vaults || []} />
      )}

      <div className="text-center text-sm text-muted-foreground mt-4">
        Powered by Berachain
      </div>
    </div>
  )
}

export default App
