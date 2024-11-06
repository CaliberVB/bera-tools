import { IInitData, IPaginateData, IPaginationQuery, Service } from './service'

/**
 * Implement common crud methods for a model
 */
export class BaseFactory<T = unknown> {
  // Endpoint to be requested
  endpoint: string

  // Service instance
  service: Service

  /**
   * Construct the base server client with endpoint param
   * @param endpoint
   * @param baseUrl
   */
  constructor(endpoint: string, baseUrl?: string) {
    this.endpoint = endpoint
    this.service = new Service({ endpoint, baseUrl } as IInitData)
  }

  /**
   * Find
   */
  async find(params?: unknown) {
    // @ts-expect-error data
    const { data, ...rest } = await this.service.get<T>({ params })
    if (data) {
      return data
    }
    return rest
  }

  /**
   * Find all model
   */
  findAll(params?: unknown) {
    return this.service.get<T[]>({ params })
  }

  /**
   * Find all model
   */
  paginate(params?: IPaginationQuery) {
    return this.service.get<IPaginateData<T>>({
      params,
    })
  }

  /**
   * Fetch online model
   * @param id
   */
  findOne(urlParams: object) {
    return this.service.getOne<T>({ url: this.endpoint, urlParams })
  }

  /**
   * Create a model
   * @param payload
   */
  create<P>(payload: P | Partial<T>) {
    return this.service.post<T>({ payload })
  }

  /**
   * Update a model
   * @param id
   * @param payload
   */
  update<P = Partial<T>>(id: string | number, payload: P) {
    return this.service.put<T>({
      id,
      payload,
    })
  }

  /**
   * Delete model
   * @param id
   */
  delete<T>(id: string | number) {
    return this.service.delete<T>({ id })
  }
}
