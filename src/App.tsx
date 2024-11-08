import { ethers } from 'ethers'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { WalletClient } from 'viem'
import { useAccount, useConnect, useWalletClient } from 'wagmi'
import { metaMask } from 'wagmi/connectors'
import * as z from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from './components/ui/button'
import { Card, CardContent } from './components/ui/card'
import { DefaultLogo } from './components/ui/default-logo'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from './components/ui/form'
import { Input } from './components/ui/input'
import { Spinner } from './components/ui/spinner'
import { TokenSymbol } from './components/ui/token-symbol'
import { Berachef__factory } from './contracts'
import { IBeraChef } from './contracts/Berachef'
import { IVault, useListVault } from './data'
import { useToast } from './hooks/use-toast'

const walletClientToSigner = async (walletClient: WalletClient) => {
  if (!walletClient.account) {
    throw new Error('No account found')
  }

  const { chain } = walletClient
  if (!chain) {
    throw new Error('Chain not found')
  }

  const provider = new ethers.BrowserProvider(window.ethereum)
  return provider.getSigner()
}

const createVaultFormSchema = (vaults: IVault[]) => {
  const schema: Record<string, z.ZodTypeAny> = {}

  vaults.forEach((vault) => {
    schema[vault.id] = z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return '0'
        return val
      })
      .refine((val) => {
        const num = parseFloat(val)
        return !isNaN(num) && num >= 0 && num <= 100
      }, 'Percentage must be between 0 and 100')
      .refine((val) => {
        return !/\.\d{3,}$/.test(val)
      }, 'Maximum 2 decimal places allowed')
  })

  return z.object(schema).refine((data) => {
    const total = Object.values(data).reduce((sum, value) => {
      if (!value) return sum
      const numValue = parseFloat(value)
      return isNaN(numValue) ? sum : sum + numValue
    }, 0)
    return Math.abs(total - 100) < 0.01
  }, 'Total percentage must equal 100%')
}

type FormValues = {
  [key: string]: string
}

const CONTRACT_ADDRESS = '0xfb81E39E3970076ab2693fA5C45A07Cc724C93c2'

const App: React.FC = () => {
  const { data: vaults, isLoading } = useListVault()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { data: walletClient } = useWalletClient()
  const [txHash, setTxHash] = useState<string | null>(null)

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

  const form = useForm<FormValues>({
    resolver: zodResolver(createVaultFormSchema(vaults || [])),
    defaultValues: vaults?.reduce(
      (acc, vault) => ({
        ...acc,
        [vault.id]: '0',
      }),
      {}
    ),
  })

  const totalPercentage = Object.values(form.watch())
    .reduce((sum, value) => {
      if (!value) return sum
      const numValue = parseFloat(value)
      return isNaN(numValue) ? sum : sum + numValue
    }, 0)
    .toFixed(2)

  const onSubmit = async (values: FormValues) => {
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

      const contract = Berachef__factory.connect(CONTRACT_ADDRESS, signer)

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

      console.log('params', address, blockNumber + 100, weights)
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

      const receipt = await tx.wait()
      console.log('Transaction confirmed:', receipt)

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

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="container max-w-xl mx-auto py-6">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="text-xl font-semibold flex items-center gap-2">
            <span className="text-2xl">🐻</span>
            <span className="text-2xl">⛓️</span>
            Berachain Validator Tools from{' '}
            <a
              href="https://caliber.build/"
              className="text-blue-500 hover:underline"
            >
              <span className="inline-flex items-center gap-1">Caliber</span>
            </a>
          </div>
        </div>

        <h1 className="text-xl font-semibold mb-6">
          Add / Update cutting board to the queue for Validator
        </h1>

        <div className="flex items-center justify-center gap-2">
          <span className="text-sm">Supported Wallets:</span>
          <div className="flex items-center gap-1">
            <span className="text-2xl">🦊</span>
            <span>Metamask</span>
          </div>
        </div>
      </div>

      {!isConnected ? (
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
      ) : (
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
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-2"
              >
                {vaults?.map((vault) => (
                  <Card key={vault.id} className="bg-card/50">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-[auto,1fr,auto] gap-4 items-center">
                        {/* Logo và Tên */}
                        <div className="flex items-center gap-3">
                          {vault.metadata.logoURI ? (
                            <img
                              src={vault.metadata.logoURI}
                              alt={vault.metadata.name}
                              className="w-8 h-8 rounded-full bg-background"
                            />
                          ) : (
                            <DefaultLogo />
                          )}
                          <div>
                            <h3 className="font-medium text-sm">
                              {vault.metadata.name}
                            </h3>
                            <div className="text-xs text-muted-foreground">
                              Other
                            </div>
                          </div>
                        </div>

                        {/* Incentives */}
                        <div className="justify-self-center">
                          <div className="text-xs text-muted-foreground mb-1">
                            Incentives
                          </div>
                          <div className="flex gap-1">
                            {vault.activeIncentives.map((incentive) => (
                              <div
                                key={incentive.id}
                                className="flex items-center gap-1"
                              >
                                <TokenSymbol symbol={incentive.token.symbol} />
                                <span className="text-xs">
                                  {incentive.token.symbol}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Input field */}
                        <FormField
                          control={form.control}
                          name={vault.id}
                          render={({ field }) => (
                            <FormItem className="w-[140px]">
                              <FormControl>
                                <Input
                                  placeholder="Enter Percentage"
                                  className="text-sm h-9"
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value

                                    if (
                                      value === '' ||
                                      /^\d*\.?\d{0,2}$/.test(value)
                                    ) {
                                      field.onChange(value || '0')
                                    }
                                  }}
                                  value={field.value === '0' ? '' : field.value}
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
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
      )}

      <div className="text-center text-sm text-muted-foreground mt-4">
        Powered by Berachain
      </div>
    </div>
  )
}

export default App
