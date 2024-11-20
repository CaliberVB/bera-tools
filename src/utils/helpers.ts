import { ethers } from 'ethers'
import { WalletClient } from 'viem'
import { z } from 'zod'

import { IVault } from '@/data'

export const walletClientToSigner = async (walletClient: WalletClient) => {
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

export const createVaultFormSchema = (vaults: IVault[]) => {
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
