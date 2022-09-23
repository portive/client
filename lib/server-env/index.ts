import { getStaticEnv } from "@thesunny/get-env"

export const env = getStaticEnv({
  ENV_NAME: process.env.ENV_NAME,
  API_ORIGIN_URL: process.env.API_ORIGIN_URL,
  PORTIVE_AUTH_TOKEN: process.env.PORTIVE_AUTH_TOKEN,
  PORTIVE_API_KEY: process.env.PORTIVE_API_KEY,
})
