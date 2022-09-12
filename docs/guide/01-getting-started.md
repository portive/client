# Getting Started

### Installing

To install `@forcloud/client` with Yarn or NPM, either:

```bash
yarn add @forcloud/client
npm install --save @forcloud/client
```

## Usage

### Create `Client`

First create a `Client` object.

```ts
// Create a demo client that uploads to a temporary folder
const client = new Client()

// Create a client that uploads to your account at the given path
const client = new Client({
  authToken: "...", // A generated `authToken`
  path: "articles/123",
})
```

### Upload

Using the `client` you can upload a File to a given path. Use the `onProgress` callback to get updates.

```ts
const hostedFile = await uploadFile(client, {
  file,
  path: "articles/123",
  onProgress(e) {
    console.log(`bytes sent: ${e.bytesSend} / ${e.bytesTotal}`)
  },
})
```

Once a `File` is uploaded, it will either have succeeded or failed. If it succeeds, and the file is an image the result will look something like:

```ts
const imageSuccessResult = {
  status: 'success',
  data: {
    type: "image"
    url: "https://files.portive.com/f/my-project/articles/123/lSIrlij920X4FSEGLXgNC--640x480.jpeg",
    size: [640,x480]
  }
}
```

If the file isn't an image it looks something like:

```ts
const nonImageSuccessResult = {
  status: "success",
  data: {
    type: "generic"
    url: "https://files.portive.com/f/my-project/articles/123/3MvYfzRqmkpY3F9BLQNj5.txt"
  }
}
```

And if it fails, it looks like:

```ts
const errorResult = {
  status: "error",
  message: "Error during upload with description",
}
```
