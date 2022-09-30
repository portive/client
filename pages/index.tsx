import Web, { s } from "nexton/web"
import Head from "next/head"
import { useCallback, useState } from "react"
import { Client, uploadFile } from "~/src"
import { env } from "~/lib/server-env"
import { HostedFileInfo } from "@portive/api-types"
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

type AuthType = "API_KEY" | "AUTH_TOKEN"

export default Web.Page<typeof getServerSideProps>(function Index({
  envName,
  apiOrigin,
  apiKey,
  authToken,
}) {
  const [authType, setAuthType] = useState<AuthType>("AUTH_TOKEN")
  const [hostedFileInfo, setHostedFileInfo] = useState<HostedFileInfo | null>(
    null
  )

  const onFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files == null) return
      const file = files[0]
      const client =
        authType === "API_KEY"
          ? new Client({ apiKey, apiOrigin })
          : new Client({ authToken, apiOrigin })
      const result = await uploadFile({
        client,
        file,
        onProgress(e) {
          console.log("onProgress", e)
        },
        onComplete(e) {
          console.log("onComplete", e)
        },
      })
      if (result) {
        console.log("result", result)
      }
      if (result.status === "success") {
        setHostedFileInfo(result.data)
      }
    },
    [authType]
  )

  return (
    <div>
      <Head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        {/* <link rel="stylesheet" href="https://unpkg.com/mvp.css@1.11/mvp.css" /> */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.css"
        />
      </Head>
      <h1>
        <img src="/favicon-32x32.png" /> Upload file with portive/client
      </h1>
      <p>
        Environment: <strong>{envName}</strong>
      </p>
      <p>
        API Origin: <strong>{apiOrigin}</strong>
      </p>
      <div>Auth Type</div>
      <div>
        <input
          id="authTypeApiKey"
          type="radio"
          name="authType"
          value="API_KEY"
          checked={authType === "API_KEY"}
          onClick={() => setAuthType("API_KEY")}
        />
        <label htmlFor="authTypeApiKey">API key</label>
      </div>
      <div>
        <input
          id="authTypeAuthToken"
          type="radio"
          name="authType"
          value="AUTH_TOKEN"
          checked={authType === "AUTH_TOKEN"}
          onClick={() => setAuthType("AUTH_TOKEN")}
        />
        <label htmlFor="authTypeAuthToken">Auth Token</label>
      </div>
      <p>
        <input type="file" onChange={onFileChange} />
      </p>
      {hostedFileInfo && (
        <blockquote>
          <p>Uploaded file...</p>
          {hostedFileInfo ? (
            <>
              <p>
                <a href={hostedFileInfo.url} rel="noreferrer" target="_blank">
                  {hostedFileInfo.url}
                </a>
              </p>
            </>
          ) : null}
          {hostedFileInfo.type === "generic" ? (
            <p>
              <iframe
                key={hostedFileInfo.url}
                src={hostedFileInfo.url}
                style={{
                  width: "100%",
                  height: 480,
                  border: "1px solid #808080",
                  borderRadius: 8,
                }}
              ></iframe>
            </p>
          ) : null}
          {hostedFileInfo.type === "image" ? (
            <>
              <p style={{ marginTop: "1em" }}>
                <img
                  key={hostedFileInfo.url}
                  src={hostedFileInfo.url}
                  style={{ maxWidth: 320 }}
                />
              </p>
              <p>Resized in 50x50</p>
              <p>
                <img
                  key={hostedFileInfo.url}
                  src={`${hostedFileInfo.url}?size=50x50`}
                />
              </p>
            </>
          ) : null}
        </blockquote>
      )}
    </div>
  )
})
