import { defineChain } from 'viem'
import { createConfig, http } from 'wagmi'
import { metaMask } from 'wagmi/connectors'

import { BERACHAIN_RPC_URL } from './config'

export const berachain = defineChain({
  id: 80084,
  name: 'Berachain bArtio',
  network: 'Berachain-Bartio',
  nativeCurrency: {
    decimals: 18,
    name: 'BERA',
    symbol: 'BERA',
  },
  rpcUrls: {
    default: {
      http: [BERACHAIN_RPC_URL],
    },
    public: {
      http: [BERACHAIN_RPC_URL],
    },
  },
})
export const config = createConfig({
  chains: [berachain],
  connectors: [metaMask()],
  transports: {
    [berachain.id]: http(),
  },
})
