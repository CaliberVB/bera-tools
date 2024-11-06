/* eslint-disable @typescript-eslint/no-explicit-any */
import { Model, ObjectsFactory } from '@/data'

export interface IVault {
  id: string
  vaultAddress: string
  stakingTokenAddress: string
  amountStaked: string
  activeIncentives: ActiveIncentive[]
  vaultWhitelist: VaultWhitelist
  metadata: Metadata
  activeIncentivesInHoney: number
  activeValidators: any[]
  activeValidatorsCount: number
  bgtInflationCapture: number
  totalBgtReceived: number
}

export interface ActiveIncentive {
  id: string
  token: Token
  amountLeft: number
  incentiveRate: number
}

export interface Token {
  address: string
  decimals: number
  symbol: string
  name: string
}

export interface Metadata {
  vaultAddress: string
  receiptTokenAddress: string
  name: string
  logoURI: string
  product: string
  url: string
  productMetadata: ProductMetadata
}

export interface ProductMetadata {
  name: string
  logoURI: string
  url: string
  description: string
}

export interface VaultWhitelist {
  whitelistedTokens: WhitelistedToken[]
}

export interface WhitelistedToken {
  isWhiteListed: boolean
  token: Token
}

export interface IVaultResponse<T> {
  vaults: T
}

export class Vault extends Model {
  static config = { endpoint: '' }

  static objects = ObjectsFactory.factory<IVault>(Vault.config)

  static async getVaults() {
    return await this.service.get<IVaultResponse<IVault[]>>({
      url: `/berachain/v1alpha1/beacon/vaults?sortBy=activeIncentivesInHoney&sortOrder=desc&page=1&filterByProduct=&pageSize=100&query=`,
    })
  }
}

Vault.init(Vault.config)
