import { DEFAULT_ORIGIN_URL } from "../upload/constants"

type ClientOptions = {
  authToken: string
  apiOrigin?: string
}

export class Client {
  authToken: string
  apiOrigin: string

  constructor({ authToken, apiOrigin = DEFAULT_ORIGIN_URL }: ClientOptions) {
    if (apiOrigin.endsWith("/"))
      throw new Error("apiOrigin should not end with a '/'")
    if (!apiOrigin.startsWith("http"))
      throw new Error(`Expected apiOrigin to start with http`)
    this.authToken = authToken
    this.apiOrigin = apiOrigin
  }
}
