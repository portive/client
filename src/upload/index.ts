import {
  ClientFileInfo,
  HostedFileInfo,
  UploadFileResponse,
  UploadProps,
} from "@portive/api-types"
import {
  UploadBeforeFetchEvent,
  UploadBeforeSendEvent,
  UploadErrorEvent,
  UploadEvent,
  UploadFinishEvent,
  UploadProgressEvent,
  UploadSuccessEvent,
} from "./types"

import { Client } from "../client"
import { UPLOAD_PATH } from "./constants"
import axios from "axios"
import { createClientFile } from "./create-client-file"
export * from "./create-client-file"
export * from "../resize"
export * from "./types"

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

export async function fetchUploadPolicy({
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
  onBeforeFetch = () => {
    /* noop */
  },
  onBeforeSend = () => {
    /* noop */
  },
  onProgress = () => {
    /* noop */
  },
  onError = () => {
    /* noop */
  },
  onSuccess = () => {
    /* noop */
  },
  onFinish = () => {
    /* noop */
  },
  onUpdate = () => {
    /* noop */
  },
}: {
  client: Client
  file: File
  // before we get the upload policy
  onBeforeFetch?: (e: UploadBeforeFetchEvent) => void
  // once we start uploading to AWS S3
  onBeforeSend?: (e: UploadBeforeSendEvent) => void
  // progress updates
  onProgress?: (e: UploadProgressEvent) => void
  // error
  onError?: (e: UploadErrorEvent) => void
  // success
  onSuccess?: (e: UploadSuccessEvent) => void
  // Called on `error` or `success` event
  onFinish?: (e: UploadFinishEvent) => void
  // Called on any change in upload state
  onUpdate?: (e: UploadEvent) => void
}): Promise<UploadFinishEvent> {
  const clientFile = await createClientFile(file)

  const beforeFetchEvent: UploadBeforeFetchEvent = {
    type: "beforeFetch",
    file,
    clientFile,
  }

  onBeforeFetch(beforeFetchEvent)
  onUpdate(beforeFetchEvent)

  const uploadPolicyResponse = await fetchUploadPolicy({
    client,
    file,
  })

  if (uploadPolicyResponse.status === "error") {
    const errorEvent: UploadErrorEvent = {
      type: "error",
      file,
      clientFile,
      message: uploadPolicyResponse.message,
    }
    onError(errorEvent)
    onFinish(errorEvent)
    onUpdate(errorEvent)
    return errorEvent
  }

  const { formFields, apiUrl: uploadUrl, fileUrl } = uploadPolicyResponse.data

  const hostedFile: HostedFileInfo =
    clientFile.type === "image"
      ? {
          type: "image",
          url: fileUrl,
          width: clientFile.width,
          height: clientFile.height,
        }
      : { type: "generic", url: fileUrl }

  /**
   * Execute `onStart` callback
   */
  const beforeSendEvent: UploadBeforeSendEvent = {
    type: "beforeSend",
    file,
    clientFile,
    hostedFile,
  }
  onBeforeSend(beforeSendEvent)

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
      const progressEvent: UploadProgressEvent = {
        type: "progress",
        file,
        clientFile,
        hostedFile,
        sentBytes: e.loaded,
        totalBytes: e.total,
      }
      onProgress(progressEvent)
      onUpdate(progressEvent)
    },
  })
  if (uploadResponse.status !== 204) {
    const errorEvent: UploadErrorEvent = {
      type: "error",
      file,
      clientFile,
      message: `Error during upload ${JSON.stringify(
        uploadResponse.data,
        null,
        2
      )}`,
    }
    onError(errorEvent)
    onFinish(errorEvent)
    onUpdate(errorEvent)
    return errorEvent
  }
  const successEvent: UploadSuccessEvent = {
    type: "success",
    file,
    clientFile,
    hostedFile,
  }
  onSuccess(successEvent)
  onFinish(successEvent)
  onUpdate(successEvent)
  return successEvent
}
