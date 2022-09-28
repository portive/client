import Web, { s } from "nexton/web"
import Head from "next/head"
import { useCallback, useState } from "react"
import { Client, uploadFile } from "~/src"
import { env } from "~/lib/server-env"
import { HostedFileInfo } from "@portive/api-types"

export const getServerSideProps = Web.getServerSideProps(
  s.object({}),
  async () => {
    return {
      envName: env.ENV_NAME,
      apiOrigin: env.API_ORIGIN_URL,
      authToken: env.PORTIVE_AUTH_TOKEN,
    }
  }
)

export default Web.Page<typeof getServerSideProps>(function Index({
  envName,
  apiOrigin,
  authToken,
}) {
  const [hostedFileInfo, setHostedFileInfo] = useState<HostedFileInfo | null>(
    null
  )

  const onFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files == null) return
      const file = files[0]
      const client = new Client({ authToken, apiOrigin })
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
    []
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
      <input type="file" onChange={onFileChange} />
      {hostedFileInfo && (
        <blockquote>
          <p>Uploaded file...</p>
          {hostedFileInfo ? (
            <div style={{ marginTop: "1em" }}>
              <a href={hostedFileInfo.url} rel="noreferrer" target="_blank">
                {hostedFileInfo.url}
              </a>
            </div>
          ) : null}
          {hostedFileInfo && hostedFileInfo.type === "image" ? (
            <div style={{ marginTop: "1em" }}>
              <img src={hostedFileInfo.url} style={{ maxWidth: 320 }} />
            </div>
          ) : null}
        </blockquote>
      )}
    </div>
  )
})
