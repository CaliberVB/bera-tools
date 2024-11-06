import { defineChain } from 'viem'
import { createConfig, http } from 'wagmi'
import { metaMask } from 'wagmi/connectors'

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
      http: ['https://bartio.rpc.berachain.com'],
    },
    public: {
      http: ['https://bartio.rpc.berachain.com'],
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
