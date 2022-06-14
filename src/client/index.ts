import { DEFAULT_ORIGIN_URL } from "../upload/constants"

type AuthTokenable = string | (() => Promise<string>) | (() => string)

type ClientOptions = {
  authToken: AuthTokenable
  apiOrigin?: string
}

export class Client {
  /**
   * We don't name it `authToken` so that people don't use it expecting it to
   * be a string.
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
