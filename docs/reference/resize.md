# Resize API

The resize API is a small API to help with resizing images while maintaining the correct aspect ratio. It does not use the `Client` object because it does not make any calls to the Portive cloud service.

## Static Methods

### `resizeIn(size: [number, number], bounds: [number, number]) => [number, number]`

Takes the original size of an image and a constraining bounds size and returns a new size of the image within the bounds.

- Preserves the aspect ratio
- The returned size will never be larger than the size of the original image

```typescript
import { resizeIn } from "@portive/client/resize"

const newSize = resizeIn([1000, 800], [100, 100])
// => [100, 80]
```
