# @portive/client

## Usage

```typescript
import { creatAuthToken } from "@portive/auth"
import { Client, uploadFile } from "@portive/client"

const authToken = createAuthToken(API_KEY, {
  path: "on/$yyyy/$mm/$dd",
  expiresIn: "1h",
})

const client = new Client({ authToken, apiOrigin })

const uploadResult = await uploadFile({
  client,
  file,
  onProgress(e) {
    console.log(e)
  },
})
```

## Design Strategy

- Separate auth and client: Keep `@portive/auth` separate from `@portive/client` because once we've developed a component, we don't need to import `@portive/client` explicitly anymore.
- `authToken` option always provided on Component: When a Component is created that uses Portive, it needs to take `authToken` as part of its arguments. It is not necessary to take `apiOrigin` because that is only required if you aren't hitting the production endpoint. When an end-developer uses the Component, they will likely never be hitting a non-production endpoint.
- Don't pass in Client to Component: Because `authToken` is the only necessary argument, we don't ask the Component user to pass in a Client. It's an unnecessary extra step.
- Do have a `Client` object though. That being said, we do have a `Client` object that needs to be created. We have this because it helps the Component developer in these ways:
  1. It's obvious what options should be passed in to the Component. It is all the options on the `Client` object. For example, it takes `authToken` but taking an `apiOrigin` as optional and perhaps a `path` as optional will be really helpful as well.
  2. By forcing the Component developer to create a Client object, it will be more likely that the Component developer will create the Client object during the initialization phase and then all the options will be passed properly whenever an API call is made. For example, let's say we have the `uploadFile` call but also a `collaborate` call. We don't want to introduce an error like forgetting to pass the `apiOrigin` to `collaborate` even though we've passed it through to `uploadFile`. After using the options to create a new `Client`, we don't have to worry about forgetting to pass through correct options through.
