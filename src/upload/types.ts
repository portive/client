import {
  ClientFile,
  HostedFileInfo,
  JSendError,
  JSendSuccess,
} from "@portive/api-types"

export type UploadStartEvent = {
  url: string
  file: File
  clientFile: ClientFile
}

export type UploadProgressEvent = {
  sentBytes: number
  totalBytes: number
  file: File
  clientFile: ClientFile
}

export type UploadCompleteEvent = JSendError | JSendSuccess<HostedFileInfo>
