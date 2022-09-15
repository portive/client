import axios from "axios"
import {
  ClientFileInfo,
  HostedFileInfo,
  JSendError,
  JSendSuccess,
  UploadFileResponse,
  UploadProps,
} from "@forcloud/api-types"
import { Client } from "../client"
import { createClientFile } from "./create-client-file"
import { UploadProgressEvent } from "./types"
import { UPLOAD_PATH } from "./constants"
export * from "./create-client-file"
export * from "../resize"

export async function getUploadPolicyFromClientFileInfo({
  client,
  clientFileInfo,
}: {
  client: Client
  clientFileInfo: ClientFileInfo
}): Promise<UploadFileResponse> {
  try {
    const response = await client.post<UploadProps, UploadFileResponse>(
      UPLOAD_PATH,
      { clientFileInfo }
    )
    return response
  } catch (e) {
    return {
      status: "error",
      message: `Error during getUploadPolicyFromClientFileInfo. ${e}`,
    }
  }
}

export async function getUploadPolicy({
  client,
  file,
}: {
  client: Client
  file: File
}): Promise<UploadFileResponse> {
  try {
    const clientFile = await createClientFile(file)

    // const apiGetPolicyUrl = `${client.apiOrigin}${UPLOAD_PATH}`

    const {
      // disable to allow eating a property
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      objectUrl: $1,
      // disable to allow eating a property
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      file: $2,
      ...clientFileInfo
    } = clientFile

    return await getUploadPolicyFromClientFileInfo({ client, clientFileInfo })
  } catch (e) {
    return {
      status: "error",
      message: `Error during getUploadPolicy. ${e}`,
    }
  }
}

/**
 * This method can be used on its own for the entire upload process which
 * includes getting the upload policy and then sending the file to the
 * cloud servers on Amazon S3.
 */
export async function uploadFile({
  client,
  file,
  onProgress,
}: {
  client: Client
  file: File
  onProgress?: (e: UploadProgressEvent) => void
}): Promise<JSendError | JSendSuccess<HostedFileInfo>> {
  const clientFile = await createClientFile(file)

  const uploadPolicyResponse = await getUploadPolicy({
    client,
    file,
  })

  if (uploadPolicyResponse.status === "error") {
    return uploadPolicyResponse
  }

  const { formFields, apiUrl: uploadUrl, fileUrl } = uploadPolicyResponse.data

  // upload file to Amazon
  const form = new FormData()
  for (const [key, value] of Object.entries(formFields)) {
    form.append(key, value)
  }
  form.append("content-type", file.type)
  form.append("file", clientFile.file)

  /**
   * Post to S3 with a callback for returning progress
   */
  const uploadResponse = await axios.post(uploadUrl, form, {
    onUploadProgress(e) {
      if (onProgress == null) return
      onProgress({
        clientFile,
        file: clientFile.file,
        sentBytes: e.loaded,
        totalBytes: e.total,
      })
    },
  })
  if (uploadResponse.status !== 204) {
    return {
      status: "error",
      message: `Error during upload ${JSON.stringify(
        uploadResponse.data,
        null,
        2
      )}`,
    }
  }
  const hostedFileInfo: HostedFileInfo =
    clientFile.type === "image"
      ? {
          type: "image",
          size: clientFile.size,
          url: fileUrl,
        }
      : {
          type: "generic",
          url: fileUrl,
        }
  return {
    status: "success",
    data: hostedFileInfo,
  }
}
