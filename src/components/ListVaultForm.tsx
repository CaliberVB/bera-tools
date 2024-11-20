import { ethers } from 'ethers'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAccount, useWalletClient } from 'wagmi'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { Spinner } from '@/components/ui/spinner'
import { BERACHEF_CONTRACT_ADDRESS } from '@/config'
import { Berachef__factory } from '@/contracts'
import { IBeraChef } from '@/contracts/Berachef'
import { IVault } from '@/data'
import { useToast } from '@/hooks/use-toast'
import { createVaultFormSchema, walletClientToSigner } from '@/utils/helpers'
import { zodResolver } from '@hookform/resolvers/zod'

import { VaultCard } from './VaultCard'

interface ListVaultFormProps {
  vaults: IVault[]
}

interface FormValues {
  [key: string]: string
}

export const ListVaultForm = ({ vaults }: ListVaultFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const { toast } = useToast()
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(createVaultFormSchema(vaults)),
    defaultValues: vaults.reduce(
      (acc, vault) => ({
        ...acc,
        [vault.id]: '0',
      }),
      {} as FormValues
    ),
  })

  const totalPercentage = Object.values(form.watch())
    .reduce((sum, value) => {
      if (!value) return sum
      const numValue = parseFloat(value)
      return isNaN(numValue) ? sum : sum + numValue
    }, 0)
    .toFixed(2)

  const onSubmit = async (values: Record<string, string>) => {
    if (!walletClient || !address) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please connect your wallet first.',
      })
      return
    }

    try {
      setIsSubmitting(true)
      const signer = await walletClientToSigner(walletClient)
      const contract = Berachef__factory.connect(
        BERACHEF_CONTRACT_ADDRESS,
        signer
      )
      const blockNumber = await signer.provider.getBlockNumber()

      const weights: IBeraChef.WeightStruct[] = Object.entries(values)
        .filter(([_, value]) => {
          const numValue = parseFloat(value)
          return !isNaN(numValue) && numValue > 0
        })
        .map(([receiverAddress, value]) => ({
          receiver: receiverAddress,
          percentageNumerator: ethers.parseUnits(value, 2),
        }))

      const tx = await contract.queueNewCuttingBoard(
        address,
        blockNumber + 100,
        weights
      )

      setTxHash(tx.hash)
      toast({
        title: 'Transaction Submitted',
        description: (
          <div className="mt-2">
            <div>Please wait for confirmation...</div>
            <a
              href={`https://bartio.beratrail.io/tx/${tx.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline mt-2 inline-block"
            >
              View on Explorer →
            </a>
          </div>
        ),
      })

      await tx.wait()
      toast({
        title: 'Success',
        description: 'Transaction confirmed successfully!',
      })
    } catch (error) {
      console.error('Transaction error:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Transaction failed. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-2 border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Allocation</h2>
          <div className="text-sm">
            Total:{' '}
            <span
              className={
                Math.abs(parseFloat(totalPercentage)) === 100
                  ? 'text-green-500'
                  : 'text-red-500'
              }
            >
              {totalPercentage}%
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            {vaults.map((vault) => (
              <VaultCard key={vault.id} vault={vault} form={form} />
            ))}

            <Button
              type="submit"
              className="w-full mt-4"
              disabled={
                isSubmitting ||
                Math.abs(parseFloat(totalPercentage) - 100) >= 0.01
              }
            >
              {isSubmitting ? <Spinner className="w-4 h-4 mr-2" /> : null}
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>

            {txHash && (
              <div className="mt-4 text-center">
                <a
                  href={`https://bartio.beratrail.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View Transaction on Explorer →
                </a>
              </div>
            )}
            {form.formState.errors.root && (
              <p className="text-sm text-destructive mt-2">
                {form.formState.errors.root.message}
              </p>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
