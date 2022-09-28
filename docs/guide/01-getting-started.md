# Getting Started

Use the Portive Client to add cloud services to any rich text editor or component.

- Upload files and images
- Resize images
- Coming soon: Retrieve URL metadata
- Coming soon: Upload from URL to cloud

## Installation

To install `@portive/client`:

```bash
# install with yarn
yarn add @portive/client

# install with npm
npm install --save @portive/client
```

## Create Client object

To use the Portive Client to upload a file or image, create a `Client` object.

```typescript
import { Client } from '@portive/client`

// Create a client using an API key
const client = new Client({
  apiKey: "...", // Your API key. Get a free one at https://portive.com/
  path: "articles/123",
})
```

> #### Using an Auth Token
>
> For more security and control, [generate an authToken](/docs/auth-token) using your API key and use it to create the `Client` object.
>
> ```typescript
> import { Client } from '@portive/client`
>
> // Create a client using an API key
> const client = new Client({
>   authToken: "...", // The `authToken` generated on the server
>   path: "articles/123",
> })
> ```

## Upload

## Upload with await and promises

Using the `client` you can upload a File to a given path. Use the `onProgress` callback to get updates.

```ts
const result = await uploadFile(client, {
  file,
  onProgress(e) {
    // log progress to console
    console.log(`bytes sent: ${e.bytesSent} / ${e.bytesTotal}`)
  },
})

// log result to console
console.log(result)

// Image uploaded successfully...
//
// {
//   status: 'success',
//   data: {
//     type: "image"
//     url: "https://files.portive.com/f/pszrw/lSIrlij920X4FSEGLXgNC--640x480.jpeg",
//     size: [640,480]
//   }
// }
//
// Not an image uploaded successfully...
//
// {
//   status: "success",
//   data: {
//     type: "generic"
//     url: "https://files.portive.com/f/pszrw/3MvYfzRqmkpY3F9BLQNj5.txt"
//   }
// }
//
// Error during upload...
//
// {
//   status: "error",
//   message: "Description of error is here",
// }
```

## Upload with callbacks
