import { Service } from './service'
import { API_ENDPOINT } from '@/utils/constants'

interface IFactoryParams {
  endpoint: string
  baseUrl?: string
}

/**
 * Core model, every model extend this class have a static init method use to implement http service adapter,
 * that's all
 */
export class Model {
  static service: Service

  static init({ endpoint, baseUrl = API_ENDPOINT }: IFactoryParams) {
    this.service = new Service({
      endpoint,
      baseUrl,
    })
  }
}
