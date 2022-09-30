import { createAuthToken } from "@portive/auth"
import { env } from "~/lib/server-env"

export default function handler(req, res) {
  const authToken = createAuthToken(env.PORTIVE_API_KEY, { expiresIn: "1m" })
  res.status(200).json({ authToken })
}
