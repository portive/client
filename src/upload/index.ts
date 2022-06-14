import axios, { AxiosResponse } from "axios"
import {
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

export async function getUploadPolicy({
  client,
  file,
}: {
  client: Client
  file: File
}): Promise<UploadFileResponse> {
  try {
    const clientFile = await createClientFile(file)

    const apiGetPolicyUrl = `${client.apiOrigin}${UPLOAD_PATH}`

    const {
      // disable to allow eating a property
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      objectUrl: $1,
      // disable to allow eating a property
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      file: $2,
      ...clientFileInfo
    } = clientFile

    const uploadProps: UploadProps = {
      authToken: client.authToken,
      clientFileInfo,
    }

    const axiosResponse: AxiosResponse<UploadFileResponse> = await axios.post(
      apiGetPolicyUrl,
      uploadProps
    )
    return axiosResponse.data
  } catch (e) {
    return {
      status: "error",
      message: `Error during getUploadPolicy. ${e}`,
    }
  }
}

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
