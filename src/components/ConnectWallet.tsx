import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { metaMask } from 'wagmi/connectors'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

import { RenderIf } from './render-if'

export const ConnectWallet = () => {
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { address, isConnected } = useAccount()
  const { toast } = useToast()

  const handleConnect = async () => {
    try {
      connect({ connector: metaMask() })
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to connect wallet. Please try again.',
      })
    }
  }

  const handleDisconnect = () => {
    disconnect()
    toast({
      title: 'Disconnected',
      description: 'Wallet disconnected successfully',
    })
  }

  return (
    <div className="space-y-4">
      <RenderIf condition={!isConnected}>
        <Card className="border-2 border-border">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Button
                className="w-full bg-[#4E46E5] hover:bg-[#4E46E5]/90"
                size="lg"
                onClick={handleConnect}
              >
                Connect Wallet
              </Button>
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold">NOTE:</span> New settings will
                take effect in 100 Blocks from the current Block number.
              </div>
            </div>
          </CardContent>
        </Card>
      </RenderIf>

      <RenderIf condition={isConnected}>
        <div className="flex items-center justify-between px-2">
          <div className="text-sm">
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            className="text-red-500 hover:text-red-600 hover:border-red-500"
          >
            Disconnect
          </Button>
        </div>
      </RenderIf>
    </div>
  )
}
