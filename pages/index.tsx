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
          console.log(e)
        },
      })
      if (result) console.log(result)
      if (result.status === "success") {
        setHostedFileInfo(result.data)
      }
    },
    []
  )

  return (
    <div>
      <Head>
        <style>{`body { font-family: sans-serif; }`}</style>
      </Head>
      <h1>Upload file with client test</h1>
      <p>Environment: {envName}</p>
      <p>API Origin: {apiOrigin}</p>
      <input type="file" onChange={onFileChange} />
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
    </div>
  )
})
