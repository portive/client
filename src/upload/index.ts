import axios from "axios"
import {
  ClientFileInfo,
  HostedFileInfo,
  JSendError,
  JSendSuccess,
  UploadFileResponse,
  UploadProps,
} from "@portive/api-types"
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
    const response = await client.post<UploadProps["data"], UploadFileResponse>(
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

type UploadResponse = JSendError | JSendSuccess<HostedFileInfo>

/**
 * This method can be used on its own for the entire upload process which
 * includes getting the upload policy and then sending the file to the
 * cloud servers on Amazon S3.
 */
export async function uploadFile({
  client,
  file,
  onProgress,
  onComplete = () => {
    /* noop */
  },
}: {
  client: Client
  file: File
  onProgress?: (e: UploadProgressEvent) => void
  onComplete?: (e: UploadResponse) => void
}): Promise<UploadResponse> {
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
    const errorResponse: JSendError = {
      status: "error",
      message: `Error during upload ${JSON.stringify(
        uploadResponse.data,
        null,
        2
      )}`,
    }
    onComplete(errorResponse)
    return errorResponse
  }
  const hostedFileInfo: HostedFileInfo =
    clientFile.type === "image"
      ? {
          type: "image",
          url: fileUrl,
          width: clientFile.width,
          height: clientFile.height,
        }
      : {
          type: "generic",
          url: fileUrl,
        }
  const successResponse: JSendSuccess<HostedFileInfo> = {
    status: "success",
    data: hostedFileInfo,
  }
  onComplete(successResponse)
  return successResponse
}
