import Web from "nexton/web"
import Head from "next/head"
import { useCallback, useState } from "react"
import { Client, UploadEvent, uploadFile } from "~/src"
import { HostedFileInfo } from "@portive/api-types"
import { getServerSideProps } from "~/components/index-page/get-server-side-props"
import { HostedFile } from "./hosted-file"

type AuthType = "API_KEY" | "AUTH_TOKEN_PROPS" | "AUTH_TOKEN_API_ROUTE"

export default Web.Page<typeof getServerSideProps>(function Index({
  envName,
  apiOrigin,
  apiKey,
  authToken,
}) {
  const [authType, setAuthType] = useState<AuthType>("AUTH_TOKEN_PROPS")
  const [uploadState, setUploadState] = useState<UploadEvent | null>(null)
  const [hostedFileInfo, setHostedFileInfo] = useState<HostedFileInfo | null>(
    null
  )

  function createClientByType() {
    if (authType === "API_KEY") {
      return new Client({ apiKey, apiOrigin })
    }
    if (authType === "AUTH_TOKEN_PROPS") {
      return new Client({ authToken, apiOrigin })
    }
    if (authType === "AUTH_TOKEN_API_ROUTE") {
      return new Client({
        authToken: async () => {
          const response = await fetch("/api/get-auth-token")
          const json = await response.json()
          return json.authToken
        },
        apiOrigin,
      })
    }
    throw new Error("This shouldn't happen")
  }

  const client = createClientByType()

  const onFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files == null) return
      const file = files[0]
      const result = await uploadFile({
        client,
        file,
        onUpdate(e) {
          console.log("onUpdate", e)
          setUploadState(e)
        },
        onBeforeFetch(e) {
          console.log("onBeforeStart", e)
        },
        onBeforeSend(e) {
          console.log("onStart", e)
        },
        onProgress(e) {
          console.log("onProgress", e)
        },
        onSuccess(e) {
          console.log("onSuccess", e)
        },
        onError(e) {
          console.log("onError", e)
        },
        onFinish(e) {
          console.log("onFinish", e)
        },
      })
      if (result) {
        console.log("result", result)
      }
      if (result.type === "success") {
        setHostedFileInfo(result.hostedFile)
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
          id="authTypeAuthTokenProps"
          type="radio"
          name="authType"
          value="AUTH_TOKEN_PROPS"
          checked={authType === "AUTH_TOKEN_PROPS"}
          onChange={() => setAuthType("AUTH_TOKEN_PROPS")}
        />
        <label htmlFor="authTypeAuthTokenProps">
          Auth Token getServerSideProps
        </label>
      </div>
      <div>
        <input
          id="authTypeAuthTokenApiRoute"
          type="radio"
          name="authType"
          value="AUTH_TOKEN_API_ROUTE"
          checked={authType === "AUTH_TOKEN_API_ROUTE"}
          onChange={() => setAuthType("AUTH_TOKEN_API_ROUTE")}
        />
        <label htmlFor="authTypeAuthTokenApiRoute">Auth Token API Route</label>
      </div>
      <div>
        <input
          id="authTypeApiKey"
          type="radio"
          name="authType"
          value="API_KEY"
          checked={authType === "API_KEY"}
          onChange={() => setAuthType("API_KEY")}
        />
        <label htmlFor="authTypeApiKey">API key</label>
      </div>
      <p>
        <input type="file" onChange={onFileChange} />
      </p>
      {uploadState && uploadState.type == "success" && (
        <HostedFile hostedFileInfo={uploadState.hostedFile} />
      )}
      {uploadState && uploadState.type == "error" && (
        <pre
          style={{
            color: "#cc0000",
            background: "#f0f0f0",
            whiteSpace: "pre-wrap",
            padding: "1em",
          }}
        >
          {uploadState.message}
        </pre>
      )}
      <pre>{JSON.stringify(uploadState, null, 2)}</pre>
    </div>
  )
})
