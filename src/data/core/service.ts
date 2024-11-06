/* eslint-disable valid-typeof */
/* eslint-disable no-constant-binary-expression */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { Axios, AxiosRequestConfig, AxiosResponse } from 'axios'
import { camelCase } from 'lodash-es'

import { config } from '@/config'
import { convertToCamelCase, convertToSnakeCase } from '@/utils'

export interface IInitData {
  endpoint: string
  baseUrl: string
}

interface IRequestParams {
  id?: string | number
  url?: string
  config?: AxiosRequestConfig
}

interface IGetParams extends IRequestParams {
  params?: any
  urlParams?: object
}

interface IPostPatchParams extends IRequestParams {
  payload: any
  urlParams?: object
}

type IDeleteRequestParams = IRequestParams

type IDeleteMultiRequestParams = {
  ids?: string[]
  url: string
  config?: AxiosRequestConfig
}

export interface IResponse<T> {
  data: T
}

export interface IResponseWithStatus<T> {
  data: T
  status: string
}

export interface IPaginateData<T> {
  data: T[]
  paging: IPaginate
}

export interface IPaginate {
  page: number
  limit: number
  total: number
  cursor?: string
  nextCursor?: string
}

export interface IPaginationQuery {
  page?: number
  limit?: number
}

export interface IPaginateResponse<T> {
  data: IPaginateData<T>
}

export interface IServiceInterceptors {
  /**
   * The key which save the authentication information in localStorage
   */
  tokenKey: string

  /**
   * Base API URL
   */
  baseUrl?: string

  locale?: string
}

export interface IGetDetailsParams {
  id: number | string | undefined
}

export enum HttpCode {
  ERROR = 'error',
  OK = 'ok',
  CREATED = 'created',
  ACCEPTED = 'accepted',
  BAD_REQUEST = 'bad_request',
  UNAUTHORIZED = 'unautorized',
  PAYMENT_REQUIRED = 'payment_required',
  FORBIDDEN = 'forbidden',
  NOT_FOUND = 'not_found',
  REQUEST_PARAMS_VALIDATION_FAILED = 'request_param_validation_failed',
  CHANGESET_VALIDATE_FAILED = 'changeset_validate_failed',
  METHOD_NOT_ALLOWED = 'method_not_allowed',
  CHANNEL_NOT_FOUND = 'channel_not_found',
  CHANNEL_CONNECTED = 'channel_connected',
  INVALID_SERVER_DATA = 'invalid_server_data',
  REGISTER_EMAIL_REQUIRED = 'register_email_required',
}

export interface IHttpError {
  httpCode: number
  message: string
  errorCode?: string
  statusCode?: string
}

export class HttpError implements IHttpError {
  httpCode: number
  message: string
  errorCode?: string
  statusCode?: string

  constructor({ httpCode, message, errorCode, statusCode }: IHttpError) {
    this.httpCode = httpCode
    this.message = message
    this.errorCode = errorCode
    this.statusCode = statusCode
  }
}

function getDefaultErrorMessage(locale?: string) {
  const unknownError = {
    en: 'Unknown error, please try again later',
    vi: 'Có lỗi xảy ra, xin hãy thử lại sau',
  }

  switch (locale) {
    case 'en':
      return unknownError.en
    case 'vi':
      return unknownError.vi
    default:
      return 'Unknown error, please try again later'
  }
}

const isClient = typeof window !== 'undefined'

function resolveResponse(response: AxiosResponse) {
  return response
}

function rejectResponse(error: any) {
  let locale
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error

  const nextError: IHttpError = {
    httpCode: 500,
    message: getDefaultErrorMessage(locale || 'vi'),
  }

  if (error?.response?.status === 401) {
    window.location.href = '/'
  }

  if (error.response) {
    nextError.httpCode = error.response.status
  }
  if (error?.response?.data?.error) {
    nextError.errorCode = error.response.data.error
  }
  if (error?.response?.data?.message) {
    nextError.message = error.response.data.message
  }
  if (error?.response?.data?.status_code) {
    nextError.statusCode = error.response.data.status_code
  }

  const errors = error?.response?.data?.errors

  if (typeof errors === 'object' && typeof errors !== null) {
    const str = Object.keys(errors)
      .map((key) => {
        if (Array.isArray(errors[key])) {
          return errors[key].join(', ')
        }
        return errors[key]
      })
      .filter((item) => typeof item === 'string')
      .join('\n')
    if (str) {
      nextError.message = str
    }
  }
  return Promise.reject(nextError)
}

export class Service {
  httpClient: () => Axios

  endpoint: string

  constructor({ endpoint, baseUrl }: IInitData) {
    this.endpoint = endpoint

    this.httpClient = () => {
      let acceptLanguage

      if (isClient) {
        acceptLanguage = localStorage.getItem(config.localeKey)
      }

      let headers = {}

      if (acceptLanguage) {
        headers = {
          ...headers,
          'Accept-Language': acceptLanguage as string,
        }
      }

      let authorization
      let persistedAuth
      if (isClient) {
        persistedAuth = localStorage.getItem(config.authKey)
      }

      if (persistedAuth) {
        authorization = `Bearer ` + persistedAuth
      }

      if (authorization) {
        headers = {
          ...headers,
          Authorization: authorization,
        }
      }

      const instance = axios.create({
        baseURL: baseUrl,
        headers: headers,
      })

      instance.interceptors.request.use((conf) => {
        conf.params = conf.params || {}
        return conf
      })

      instance.interceptors.response.use(resolveResponse, rejectResponse)

      return instance
    }
  }

  static interceptors({ locale }: IServiceInterceptors) {
    // Add a request interceptor
    axios.interceptors.request.use(
      function (config) {
        config.headers['Accept-Language'] = locale as string

        return config
      },
      function (error) {
        // Do something with request error
        return Promise.reject(error)
      }
    )

    // Add a response interceptor
    axios.interceptors.response.use(
      function (response) {
        // Any status code that lie within the range of 2xx cause this function to trigger
        // Do something with response data
        return response
      },
      function (error) {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        // Do something with response error
        const nextError: IHttpError = {
          httpCode: 500,
          message: getDefaultErrorMessage(locale),
        }

        if (error.response && error.response.status) {
          if (error.response.status === 401) {
            window.location.href = '/'
          }
        }

        if (error.response) {
          nextError.httpCode = error.response.status
        }

        if (error?.response?.data?.message) {
          nextError.message = error.response.data.message
        }
        if (error?.response?.data?.status_code) {
          nextError.statusCode = error.response.data.status_code
        }

        const errors = error?.response?.data?.errors

        if (typeof errors === 'object' && typeof errors !== null) {
          const str = Object.keys(errors)
            .map((key) => {
              if (Array.isArray(errors[key])) {
                return key + ' ' + errors[key].join(', ')
              }
              return key + ' ' + errors[key]
            })
            .filter((item) => typeof item === 'string')
            .join('\n')
          if (str) {
            nextError.message = str
          }
        }

        return Promise.reject(nextError)
      }
    )
  }

  /**
   * Make url for findOne and update method
   * @param id
   */
  makeOneUrl(id: string | number) {
    return (this.endpoint + '/').replace('//', '/') + id
  }

  /**
   * To do url interpolation using colons as the delimiter
   */

  interpolateUrl(url: string, params: object) {
    url = url.replace('//', '/')
    const result: any[] = []

    url.split('/:').forEach((segment, i) => {
      if (i === 0) {
        return result.push(segment)
      } else {
        const segmentMatch = segment.match(/(\w+)(?:[?*])?(.*)/)
        const key = camelCase(segmentMatch![1])

        if (params[key as keyof typeof segmentMatch] !== undefined) {
          result.push('/' + params[key as keyof typeof segmentMatch])
        } else {
          result.push('/:' + key)
        }

        result.push(segmentMatch![2] || '')
      }
    })

    return result.join('')
  }

  init({ endpoint }: IInitData) {
    this.endpoint = endpoint
  }

  private toSnakeCase<T extends object>(obj: T): T {
    return convertToSnakeCase(obj) as T
  }

  /**
   * Extract data from axios response
   * @param response axios response
   */
  resolve<T>(response: AxiosResponse<T>): T {
    if (typeof response.data === 'object' && response.data !== null) {
      return convertToCamelCase(response.data as object) as T
    }
    return response.data
  }

  /**
   * Overwrite GET method
   * @param {IGetParams} configs
   * @param noConvertCase
   * @param downloadFile
   * @param noSnakeCase
   */
  async get<T>(
    configs?: IGetParams,
    noConvertCase?: boolean,
    downloadFile?: boolean,
    noSnakeCase?: boolean
  ) {
    const { url, params } = configs || {}
    const snakeCaseParams = noSnakeCase ? params : this.toSnakeCase(params)
    const request = this.httpClient().get<T>(url || this.endpoint, {
      params: snakeCaseParams,
      responseType: downloadFile ? 'blob' : undefined,
    })
    if (noConvertCase) {
      const res = await request
      return res.data
    }
    const response = await request
    return this.resolve(response)
  }

  /**
   * Overwrite GET method for one model
   * @param {IGetParams} configs
   */
  async getOne<T>(configs?: IGetParams) {
    const { url, params, urlParams } = configs || {}

    const baseUrl: string = url || this.endpoint || ''
    let getUrl = baseUrl
    if (urlParams && Object.keys(urlParams).length > 0) {
      getUrl = this.interpolateUrl(baseUrl, this.toSnakeCase(urlParams))
    }

    const response = await this.httpClient().get<T>(getUrl, {
      params: this.toSnakeCase(params),
    })
    return this.resolve(response)
  }

  /**
   * Overwrite POST method
   * @param url
   * @param params
   */
  async post<T>(
    { url, payload, config = {}, urlParams }: IPostPatchParams,
    isSnakeCase = true
  ) {
    const baseUrl: string = url || this.endpoint || ''
    let postUrl = baseUrl
    if (urlParams && Object.keys(urlParams).length > 0) {
      postUrl = this.interpolateUrl(baseUrl, this.toSnakeCase(urlParams))
    }

    const snakeCasePayload = isSnakeCase ? this.toSnakeCase(payload) : payload

    // Merge existing headers with new config
    const mergedConfig = {
      ...config,
      headers: {
        ...config.headers,
      },
    }

    const request = this.httpClient().post<T>(
      postUrl,
      snakeCasePayload,
      mergedConfig
    )

    if (mergedConfig?.responseType === 'blob') {
      const res = await request
      return res.data
    }

    const response = await request
    return this.resolve(response)
  }

  /**
   * Overwrite PATCH method
   * @param url
   * @param params
   */
  async put<T>({ id, url, payload }: IPostPatchParams) {
    const snakeCasePayload = this.toSnakeCase(payload)
    const response = await this.httpClient().put<T>(
      url || this.makeOneUrl(id as string),
      snakeCasePayload
    )
    return this.resolve(response)
  }

  async interpolatePut<T>({ url, urlParams, payload }: IPostPatchParams) {
    const putUrl = this.interpolateUrl(
      url as string,
      this.toSnakeCase(urlParams as object)
    )
    const snakeCasePayload = this.toSnakeCase(payload)
    const response = await this.httpClient().put<T>(putUrl, snakeCasePayload)
    return this.resolve(response)
  }

  /**
   * Overwrite DELETE method
   * @param url
   * @param payload
   */
  async delete<T>({ url, id }: IDeleteRequestParams) {
    const response = await this.httpClient().delete<T>(
      url || this.makeOneUrl(id as string)
    )
    return this.resolve(response)
  }

  async interpolateDelete<T>(url: string, params: object) {
    const deleteUrl = this.interpolateUrl(url, params)
    const response = await this.httpClient().delete<T>(deleteUrl)
    return this.resolve(response)
  }

  async deleteMulti<T>({ url, ids }: IDeleteMultiRequestParams) {
    const response = await this.httpClient().delete<T>(url, {
      params: { ids },
    })
    return this.resolve(response)
  }

  /**
   * Upload
   * @param payload
   * @param {string} url
   * @return {Promise<T>}
   */
  async upload<T>(payload: any, url?: string) {
    const response = await this.httpClient().post<T>(
      url || this.endpoint,
      payload,
      {
        headers: {
          'content-type': 'multipart/form-data',
        },
      }
    )
    return this.resolve(response)
  }

  /**
   *  Upload
   * @param payload
   * @param {string} url
   * @return {Promise<T>}
   */
  async uploadAvatar<T>(payload: any, url?: string) {
    const response = await this.httpClient().put<T>(
      url || this.endpoint,
      payload,
      {
        headers: {
          'content-type': 'multipart/form-data',
        },
      }
    )
    return this.resolve(response)
  }

  /**
   * Upload single file
   * @param {File} file
   * @param {string} url
   * @return {Promise<T>}
   */
  uploadSingleFile<T>(file: File, url?: string) {
    const formData = new FormData()
    formData.append('file', file)
    return this.upload<T>(formData, url)
  }
}
