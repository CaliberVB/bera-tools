import { useAccount } from 'wagmi'

import { ConnectWallet } from '@/components/ConnectWallet'
import { CuttingBoardDisplay } from '@/components/CuttingBoardDisplay'
import { Header } from '@/components/Header'
import { ListVaultForm } from '@/components/ListVaultForm'
import { RenderIf } from '@/components/render-if'
import { Spinner } from '@/components/ui/spinner'
import { useListVault } from '@/data'
import { useCuttingBoards } from '@/hooks/use-cutting-boards'

const App = () => {
  const { data: vaults, isLoading: isLoadingVaults } = useListVault()
  const {
    isLoading: isLoadingBoards,
    currentBlock,
    activeCuttingBoard,
    queuedCuttingBoard,
  } = useCuttingBoards()
  const { isConnected } = useAccount()

  if (isLoadingVaults) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="container max-w-xl mx-auto py-6">
      <Header />
      <ConnectWallet />

      <RenderIf condition={isConnected}>
        <div className="space-y-4 mt-4">
          <RenderIf condition={!isLoadingBoards}>
            <CuttingBoardDisplay
              title="Active Cutting Board"
              cuttingBoard={activeCuttingBoard}
              vaults={vaults || []}
            />

            <CuttingBoardDisplay
              title="Queued Cutting Board"
              cuttingBoard={queuedCuttingBoard}
              vaults={vaults || []}
              currentBlock={currentBlock}
            />
          </RenderIf>

          <ListVaultForm vaults={vaults || []} />
        </div>
      </RenderIf>

      <div className="text-center text-sm text-muted-foreground mt-4">
        Powered by Berachain
      </div>
    </div>
  )
}

export default App
