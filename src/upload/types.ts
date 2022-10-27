import { ClientFile, HostedFileInfo } from "@portive/api-types"

export type { ClientFile, HostedFileInfo }

/**
 * Called when the upload is intiated, before fetching the upload policy which
 * is required for uploading the file to the servers.
 */
export type UploadBeforeFetchEvent = {
  type: "beforeFetch"
  file: File
  clientFile: ClientFile
  // `hostedFile` does not exist until after we get the upload policy
}

/**
 * Called after the upload policy has been fetched and right before sending the
 * upload to the server. At this point, the destination `url` is known and is
 * provided as part of the `hostedFile`
 */
export type UploadBeforeSendEvent = {
  type: "beforeSend"
  file: File
  clientFile: ClientFile
  hostedFile: HostedFileInfo
}

/**
 * Called intermmitently during the upload. This event can be used to show a
 * progress bar using the `senteBytes` and `totalBytes`
 */
export type UploadProgressEvent = {
  type: "progress"
  file: File
  clientFile: ClientFile
  hostedFile: HostedFileInfo
  sentBytes: number
  totalBytes: number
}

/**
 * Called if there is an error anytime during the upload process.
 */
export type UploadErrorEvent = {
  type: "error"
  message: string
  file: File
  clientFile: ClientFile
  // Note: Omit `hostedFile` because error may come before it is available
}

/**
 * Called after a successful upload. At this point, the file exists on the
 * cloud servers.
 */
export type UploadSuccessEvent = {
  type: "success"
  file: File
  clientFile: ClientFile
  hostedFile: HostedFileInfo
}

/**
 * This event represents the end state of an upload. Every upload either ends
 * in a successful upload or in an error.
 */
export type UploadFinishEvent = UploadSuccessEvent | UploadErrorEvent
