import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { useAccount, useWalletClient } from 'wagmi'

import { BERACHAIN_RPC_URL, BERACHEF_CONTRACT_ADDRESS } from '@/config'
import { Berachef__factory } from '@/contracts'
import { IBeraChef } from '@/contracts/Berachef'

export const useCuttingBoards = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [currentBlock, setCurrentBlock] = useState<bigint>()
  const [activeCuttingBoard, setActiveCuttingBoard] =
    useState<IBeraChef.CuttingBoardStructOutput | null>(null)
  const [queuedCuttingBoard, setQueuedCuttingBoard] =
    useState<IBeraChef.CuttingBoardStructOutput | null>(null)
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()

  useEffect(() => {
    const fetchCuttingBoards = async () => {
      if (!walletClient || !address) {
        setIsLoading(false)
        return
      }

      try {
        const provider = new ethers.JsonRpcProvider(BERACHAIN_RPC_URL)
        const contract = Berachef__factory.connect(
          BERACHEF_CONTRACT_ADDRESS,
          provider
        )

        const [activeBoard, queuedBoard, blockNumber] = await Promise.all([
          contract.getActiveCuttingBoard(address),
          contract.getQueuedCuttingBoard(address),
          provider.getBlockNumber(),
        ])

        setCurrentBlock(BigInt(blockNumber))
        setActiveCuttingBoard(activeBoard)
        setQueuedCuttingBoard(queuedBoard)
      } catch (error) {
        console.error('Error fetching cutting boards:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCuttingBoards()
  }, [walletClient, address])

  return {
    isLoading,
    currentBlock,
    activeCuttingBoard,
    queuedCuttingBoard,
  }
}
