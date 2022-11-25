import Web, { s } from "nexton/web"
import { env } from "~/lib/server-env"
import { createAuthToken } from "@portive/auth"

export const getServerSideProps = Web.getServerSideProps(
  s.object({}),
  async () => {
    const authToken = createAuthToken(env.PORTIVE_API_KEY, { expiresIn: "1d" })
    return {
      apiKey: env.PORTIVE_API_KEY,
      envName: env.ENV_NAME,
      apiOrigin: env.API_ORIGIN_URL,
      authToken,
    }
  }
)
