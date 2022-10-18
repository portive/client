import { ClientFile, HostedFileInfo } from "@portive/api-types"

export type UploadBeforeFetchEvent = {
  type: "beforeFetch"
  file: File
  clientFile: ClientFile
  // `hostedFile` does not exist until after we get the upload policy
}

export type UploadBeforeSendEvent = {
  type: "beforeSend"
  file: File
  clientFile: ClientFile
  hostedFile: HostedFileInfo
}

export type UploadProgressEvent = {
  type: "progress"
  file: File
  clientFile: ClientFile
  hostedFile: HostedFileInfo
  sentBytes: number
  totalBytes: number
}

export type UploadErrorEvent = {
  type: "error"
  message: string
  file: File
  clientFile: ClientFile
  // Note: Omit `hostedFile` because error may come before it is available
}

export type UploadSuccessEvent = {
  type: "success"
  file: File
  clientFile: ClientFile
  hostedFile: HostedFileInfo
}

export type UploadFinishEvent = UploadSuccessEvent | UploadErrorEvent
