/* eslint-disable @typescript-eslint/no-explicit-any */
import { UseFormReturn } from 'react-hook-form'

import { Card, CardContent } from '@/components/ui/card'
import { DefaultLogo } from '@/components/ui/default-logo'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { TokenSymbol } from '@/components/ui/token-symbol'
import { IVault } from '@/data'

interface VaultCardProps {
  vault: IVault
  form: UseFormReturn<any>
}

export const VaultCard = ({ vault, form }: VaultCardProps) => {
  return (
    <Card key={vault.id} className="bg-card/50">
      <CardContent className="p-4">
        <div className="grid grid-cols-[auto,1fr,auto] gap-4 items-center">
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
              <h3 className="font-medium text-sm">{vault.metadata.name}</h3>
              <div className="text-xs text-muted-foreground">Other</div>
            </div>
          </div>

          <div className="justify-self-center">
            <div className="text-xs text-muted-foreground mb-1">Incentives</div>
            <div className="flex gap-1">
              {vault.activeIncentives.map((incentive) => (
                <div key={incentive.id} className="flex items-center gap-1">
                  <TokenSymbol symbol={incentive.token.symbol} />
                  <span className="text-xs">{incentive.token.symbol}</span>
                </div>
              ))}
            </div>
          </div>

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
                      if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
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
  )
}
