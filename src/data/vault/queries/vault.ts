import { IHttpError } from '@/data'
import { useQuery } from '@tanstack/react-query'

import { IVault, Vault } from '../models'

const GET_LIST_TOKEN_KEY = 'GET_LIST_TOKEN_KEY'

export function useListVault() {
  return useQuery<IVault[], IHttpError>({
    queryKey: [GET_LIST_TOKEN_KEY],
    queryFn: async (): Promise<IVault[]> => {
      const response = await Vault.getVaults()

      return response.vaults
    },
  })
}
