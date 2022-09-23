export const DEFAULT_ORIGIN_URL = "https://api.portive.com"
export const UPLOAD_PATH = "/api/v1/upload"

/**
 * These just protect us from stupid mistakes
 */
if (DEFAULT_ORIGIN_URL.endsWith("/"))
  throw new Error(`DEFAULT_ROGIN_URL should not end with a '/'`)
if (!UPLOAD_PATH.startsWith("/"))
  throw new Error("UPLOAD_PATH should start with a '/'")
