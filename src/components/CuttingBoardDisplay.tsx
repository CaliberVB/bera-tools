import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IBeraChef } from '@/contracts/Berachef'
import { IVault } from '@/data'

interface CuttingBoardDisplayProps {
  title: string
  cuttingBoard: IBeraChef.CuttingBoardStructOutput | null
  vaults: IVault[]
  currentBlock?: bigint
}

export const CuttingBoardDisplay = ({
  title,
  cuttingBoard,
  vaults,
  currentBlock,
}: CuttingBoardDisplayProps) => {
  if (!cuttingBoard || cuttingBoard.weights.length === 0) {
    return null
  }

  const getVaultDisplay = (address: string) => {
    const vault = vaults.find(
      (v) => v.id.toLowerCase() === address.toLowerCase()
    )

    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`
    const gaugeUrl = `https://bartio.station.berachain.com/gauge/${address}`

    return {
      name: vault?.metadata.name || shortAddress,
      url: gaugeUrl,
    }
  }

  const formatPercentage = (percentageNumerator: bigint) => {
    return (Number(percentageNumerator) / 100).toFixed(2)
  }

  const blocksRemaining =
    currentBlock && currentBlock < cuttingBoard.startBlock
      ? Number(cuttingBoard.startBlock - currentBlock)
      : null

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          {blocksRemaining !== null && (
            <span className="text-sm font-normal text-muted-foreground">
              Starts in {blocksRemaining} blocks
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {cuttingBoard.weights.map((weight, index) => {
            const vault = getVaultDisplay(weight.receiver)
            return (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted/50 rounded"
              >
                <a
                  href={vault.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-500 hover:text-blue-600 hover:underline"
                >
                  {vault.name}
                </a>
                <span>{formatPercentage(weight.percentageNumerator)}%</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
