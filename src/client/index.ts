import { DEFAULT_ORIGIN_URL } from "../upload/constants"
import { Resolvable, resolve } from "resolvable-value"
import { JsonObject } from "type-fest"
import axios, { AxiosResponse } from "axios"

// export type AuthTokenable = string | (() => Promise<string>) | (() => string)

export type ClientOptions = {
  apiKey?: Resolvable<string>
  authToken?: Resolvable<string>
  apiOrigin?: string
}

/**
 * Create a `Client` object and return it.
 */
export function createClient(options: ClientOptions): Client {
  return new Client(options)
}

/**
 * Create a `Client` object that we pass to the API functions.
 *
 * We enforce the creation of a `Client` object for a few reasons:
 *
 * 1. It helps us not have to deal with `authTokenable` separately for every
 *    API function call.
 * 2. It makes it easy for any components to support any initialization changes
 *    by just initializing with `ClienOptions`. For example, if we wanted to
 *    add a `path` property back in the future, we just have to implement at
 *    one place.
 * 3. It's self documenting on what you should probably accept as part of your
 *    initialization if you want to fully support all the options. For example,
 *    we can see here that `apiOrigin` is an option to support. If it's
 *    part of multiple function signature like in `upload`, then it may not
 *    be so easy to remember to pass all the values through at each function
 *    invocation location.
 */
export class Client {
  /**
   * We don't name it `authToken` so that people don't use it expecting it to
   * always be a string. It's named to imply that whatever it is can be
   * turned into an `authToken`.
   */
  unresolvedApiKey: undefined | Resolvable<string>
  unresolvedAuthToken: undefined | Resolvable<string>
  apiOrigin: string

  constructor({
    apiKey,
    authToken,
    apiOrigin = DEFAULT_ORIGIN_URL,
  }: ClientOptions) {
    if (apiKey == null && authToken == null) {
      throw new Error(
        `apiKey or authToken must be defined but neither are defined`
      )
    }
    if (apiOrigin.endsWith("/"))
      throw new Error("apiOrigin should not end with a '/'")
    if (!apiOrigin.startsWith("http"))
      throw new Error(`Expected apiOrigin to start with http`)
    // this.authTokenable = authToken
    this.unresolvedApiKey = apiKey
    this.unresolvedAuthToken = authToken
    this.apiOrigin = apiOrigin
  }

  /**
   * Posts at the given path with the `apiKey` or `authToken`.
   */
  async post<
    /**
     * FIXME:
     *
     * This is a little messy. We don't actually want the `apiKey` or `authToken`
     * to be passed in. We just don't want it to collide with the `data`. But
     * perhaps this is better done by passing `data` separately.
     */
    P extends { apiKey?: string; authToken?: string } & JsonObject,
    R extends JsonObject
  >(path: string, data: P): Promise<R> {
    if (!path.startsWith("/"))
      throw new Error(
        `Expected path to start with "/" but is ${JSON.stringify(path)}`
      )
    const url = `${this.apiOrigin}${path}`
    const postData: P & { apiKey?: string; authKey?: string } = {
      ...data,
    }
    const authToken = await this.getAuthToken()
    const apiKey = await this.getApiKey()
    if (typeof authToken === "string" && typeof apiKey === "string") {
      throw new Error(
        `Expected one of 'authToken' or 'apiKey' to be defined but both are defined which is ambiguous`
      )
    } else if (typeof authToken === "string") {
      postData.authToken = authToken
    } else if (typeof apiKey === "string") {
      postData.apiKey = apiKey
    } else {
      throw new Error(
        `Expected either 'authToken' or 'apiKey' to be defined but neither are defined`
      )
    }
    const axiosResponse = await axios.post<R, AxiosResponse<R>, P>(
      url,
      postData
    )
    return axiosResponse.data
  }

  /**
   * Gets the apiKey for the client. If it is a function, it gets the return
   * value of the function. If that returns a promise, it awaits it.
   */
  async getApiKey(): Promise<string | undefined> {
    return this.unresolvedApiKey ? resolve(this.unresolvedApiKey) : undefined
  }

  /**
   * Gets the authToken for the client. If it is a function, it gets the return
   * value of the function. If that returns a promise, it awaits it.
   */
  async getAuthToken(): Promise<string | undefined> {
    return this.unresolvedAuthToken
      ? resolve(this.unresolvedAuthToken)
      : undefined
  }
}
