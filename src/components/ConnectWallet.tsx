import { useConnect } from 'wagmi'
import { metaMask } from 'wagmi/connectors'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export const ConnectWallet = () => {
  const { connect } = useConnect()
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

  return (
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
            <span className="font-semibold">NOTE:</span> New settings will take
            effect in 100 Blocks from the current Block number.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
