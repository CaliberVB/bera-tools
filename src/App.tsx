import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAccount, useConnect } from 'wagmi'
import { metaMask } from 'wagmi/connectors'
import * as z from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from './components/ui/button'
import { Card, CardContent } from './components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from './components/ui/form'
import { Input } from './components/ui/input'
import { Spinner } from './components/ui/spinner'
import { IVault, useListVault } from './data'
import { useToast } from './hooks/use-toast'

const DefaultLogo = () => (
  <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center">
    <svg
      width="32"
      height="32"
      viewBox="0 0 144 144"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full p-[15%]"
    >
      <path
        d="M96 96L114 48L132 96C126.78 99.9 120.48 102 114 102C107.52 102 101.22 99.9 96 96Z"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M12 96L30 48L48 96C42.78 99.9 36.48 102 30 102C23.52 102 17.22 99.9 12 96Z"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M42 126H102"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M72 18V126"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M18 42H30C42 42 60 36 72 30C84 36 102 42 114 42H126"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  </div>
)

const TokenSymbol = ({ symbol }: { symbol: string }) => {
  const bgColor = `hsl(${Math.random() * 360}, 70%, 20%)`
  return (
    <div
      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium"
      style={{ backgroundColor: bgColor }}
    >
      {symbol.slice(0, 2)}
    </div>
  )
}

const createVaultFormSchema = (vaults: IVault[]) => {
  const schema: Record<string, z.ZodTypeAny> = {}

  vaults.forEach((vault) => {
    schema[vault.id] = z
      .number()
      .min(0, 'Percentage must be at least 0')
      .max(100, 'Percentage must be at most 100')
      .optional()
      .transform((val) => val || 0)
  })

  return z.object(schema).refine((data) => {
    const total = Object.values(data).reduce(
      (sum, value) => sum + (value || 0),
      0
    )
    return total === 100
  }, 'Total percentage must equal 100%')
}

type FormValues = {
  [key: string]: number
}

const App: React.FC = () => {
  const { data: vaults, isLoading } = useListVault()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { address, isConnected } = useAccount()
  console.log('🚀 ~ address:', address)
  const { connect } = useConnect()

  const handleConnect = async () => {
    try {
      connect({ connector: metaMask() })
    } catch (error) {
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
        [vault.id]: 0,
      }),
      {}
    ),
  })

  const totalPercentage = Object.values(form.watch()).reduce(
    (sum, value) => sum + (value || 0),
    0
  )

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log(values)
      toast({
        title: 'Success',
        description: 'Your changes have been saved.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
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
                    totalPercentage === 100 ? 'text-green-500' : 'text-red-500'
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
                                  type="number"
                                  placeholder="Enter Percentage"
                                  className="text-sm h-9"
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value
                                    field.onChange(
                                      value === ''
                                        ? undefined
                                        : parseFloat(value)
                                    )
                                  }}
                                  value={field.value || ''}
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
                  disabled={isSubmitting || totalPercentage !== 100}
                >
                  {isSubmitting ? <Spinner className="w-4 h-4 mr-2" /> : null}
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>

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
