import {
  ClientFile,
  ClientGenericFile,
  ClientImageFile,
} from "@portive/api-types"

/**
 * Array of supported image content types.
 */
const SUPPORTED_IMAGE_TYPES = [
  "image/jpg",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]

/**
 * Returns true if the passed in `File` object is a supported image type.
 * A supported image is able to be resized dynamically on the server.
 */
export function isHostedImage(file: File): boolean {
  return SUPPORTED_IMAGE_TYPES.includes(file.type)
}

/**
 * Takes a `url` to an image and returns its size as a tuple `[width, height]`.
 *
 * It works by creating an `Image` object, assigning the `url` to its `src`
 * and waiting for it to load then finding its `naturalWidth` and `naturalHeight`.
 */
async function getImageSize(
  url: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const image = new Image()
    image.addEventListener("load", function () {
      resolve({
        width: this.naturalWidth,
        height: this.naturalHeight,
      })
    })
    image.src = url
  })
}

/**
 * Keeps a WeakMap of `File` to `ClientFile` mappings. This lets a developer
 * call `createClientFile` before the `uploadFile` method to get important
 * information about the file. The operation to the get the image width/height
 * is costly so we use this WeakMap to memoize the results.
 */
const CLIENT_FILE_MAP = new WeakMap<File, ClientFile>()

/**
 * Takes a `File` object and returns a `ClientFile` object with some useful
 * properties. The values are cached in the WeakMap `CLIENT_FILE_MAP` because
 * of the expensive `getImageSize` function.
 *
 * - type: `image` or `generic`
 * - size: [width, height]
 * - objectUrl: a URL that can be used as the image src before the image is uploaded
 */
export async function createClientFile(
  file: File | ClientFile
): Promise<ClientFile> {
  if (!(file instanceof File)) return file
  const cachedClientFile = CLIENT_FILE_MAP.get(file)
  if (cachedClientFile !== undefined) {
    return cachedClientFile
  }
  const objectUrl = URL.createObjectURL(file)
  if (isHostedImage(file)) {
    const imageSize = await getImageSize(objectUrl)
    const clientImageFile: ClientImageFile = {
      type: "image",
      filename: file.name,
      contentType: file.type,
      bytes: file.size,
      width: imageSize.width,
      height: imageSize.height,
      file,
      objectUrl,
    }
    CLIENT_FILE_MAP.set(file, clientImageFile)
    return clientImageFile
  } else {
    const clientGenericFile: ClientGenericFile = {
      type: "generic",
      filename: file.name,
      contentType: file.type,
      bytes: file.size,
      file,
      objectUrl,
    }
    CLIENT_FILE_MAP.set(file, clientGenericFile)
    return clientGenericFile
  }
}
