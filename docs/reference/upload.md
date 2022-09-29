# Upload API

Upload a file or image to the Portive cloud.

- [Upload API](#upload-api)
  - [Static Methods](#static-methods)
    - [`uploadFile`](#uploadfile)

## Static Methods

### `uploadFile`

Upload a file to the Portive cloud.

```typescript
// `uploadFile` function signature

function uploadFile({
  client,
  file,
  onProgress = () => {},
  onComplete = () => {},
}: {
  client: Client
  file: File
  onProgress?: (e: ProgressEvent) => void
  onComplete?: (e: CompleteEvent) => void
}): Promise<CompleteEvent> {}

// current progress of the upload
type ProgressEvent = {
  sentBytes: number
  totalBytes: number
  file: File
  clientFile: ClientFile
}

// the final state of the upload (can be a successful upload or an error)
type CompleteEvent =
  | { status: "success"; type: "generic"; url: string }
  | { status: "success"; type: "image"; url: string; size: [number, number] }
  | { status: "error"; message: string }
```

Takes an instance of a [`Client`](./client.md) object and a [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File) object and uploads it to the cloud.

During the upload, the `onProgress` callback is called intermittently. This can be used to display a progress bar.

When the upload is complete, the `onComplete` callback is called once returning the final status of the upload (`CompleteEvent`). It can be a success or an error.

When the upload is complete, the returned Promise will return the final status of the upload (`CompleteEvent`).

Note that the successfully uploaded file can be a `generic` file or an `image` file which also return a size as a tuple of `[width, height]`
