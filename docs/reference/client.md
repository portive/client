# Client

The `Client` object is used to make API calls to the Portive API.

Usually, you instantiate the `Client` object then pass it to other methods which use the `Client` instance. for example, the [`uploadFile`](./upload.md) method.

- [Instantiation Methods](#instantiation-methods)
- [Instance Methods](#instance-methods)

## Instantiation Methods

### `createClient(options: ClientOptions) => Client`

Create an instance of the Portive Client.

```typescript
type ClientOptions = {
  apiKey?: string | () => string | () => Promise<string>
  authToken?: string | () => string | () => Promise<string>
  apiOrigin?: string
}
```

You must provide an `apiKey` or an `authToken` which can be either a `string`, a function that returns a `string` or an async function that returns a `Promise<string>`.

Optionally, you can provide a string that represents an `apiOrigin` which is an http origin where we expect the API to exist like `http://localhost:3001`. By default this is set the origin for the Portive API at `https://api.portive.com`. Normally you would only change this for testing only.

```typescript
// sample instantiation
import { createClient } from "@portive/client"

const client = createClient({ apiKey: "API_KEY" })
```

## Instance Methods

### `post(path: string, data: JsonObject) => Promise<JsonObject>`

Posts against an API endpoint. Usually, we don't call this directly and instead use specific methods in this client library like `upload`; however, underneath the hood, API calls are made using this `post` method.

Note that the return value is `Promise<JsonObject>` but the API always returns values in a subset of JSON which is the [JSend Format](https://github.com/omniti-labs/jsend). It looks like:

```javascript
{status: "success", data: {value: "success values returned in 'data' object"}}
{status: "fail", data: {value: "fail values returned in 'data' object"}}
{status: "error", message: "There was an error"}
```

### `getApiKey() => Promise<string | undefined>`

Takes the `apiKey` that the `Client` was created with and then resolves it to a `string`. For example, if the `apiKey` was passed in as a function, it would execute the function and return the value of the function.

Note that this returns as a `Promise` so use with `await`

```typescript
const client = new Client({ apiKey: async () => "API_KEY" })
const resolvedApiKey = await client.getApiKey()
// => "API_KEY"
```

### `getAuthKey() => Promise<string | undefined>`

Takes the `authToken` that the `Client` was created with and then resolves it to a `string`. For example, if the `authToken` was passed in as a function, it would execute the function and return the value of the function.

Note that this returns as a `Promise` so use with `await`

```typescript
const client = new Client({ authToken: async () => "AUTH_TOKEN" })
const resolvedAuthToken = await client.getAuthToken()
// => "AUTH_TOKEN"
```
