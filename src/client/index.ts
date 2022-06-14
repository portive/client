import { DEFAULT_ORIGIN_URL } from "../upload/constants"

export type AuthTokenable = string | (() => Promise<string>) | (() => string)

export type ClientOptions = {
  authToken: AuthTokenable
  apiOrigin?: string
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
  authTokenable: AuthTokenable
  apiOrigin: string

  constructor({ authToken, apiOrigin = DEFAULT_ORIGIN_URL }: ClientOptions) {
    if (apiOrigin.endsWith("/"))
      throw new Error("apiOrigin should not end with a '/'")
    if (!apiOrigin.startsWith("http"))
      throw new Error(`Expected apiOrigin to start with http`)
    this.authTokenable = authToken
    this.apiOrigin = apiOrigin
  }

  async getAuthToken(): Promise<string> {
    const { authTokenable: _authToken } = this
    if (typeof _authToken === "string") return _authToken
    const authTokenValue = await _authToken()
    return authTokenValue
  }
}
