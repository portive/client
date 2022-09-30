import { createAuthToken } from "@portive/auth"

export default function handler(req, res) {
  const authToken = createAuthToken(process.env.PORTIVE_API_KEY, {
    expiresIn: "1m",
  })
  res.status(200).json({ authToken })
}
