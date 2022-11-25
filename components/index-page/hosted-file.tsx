import { HostedFileInfo } from "@portive/api-types"

export function HostedFile({
  hostedFileInfo,
}: {
  hostedFileInfo: HostedFileInfo
}) {
  return (
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
  )
}
