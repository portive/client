type ImageSize = { width: number; height: number }

export function resizeIn(size: ImageSize, bounds: ImageSize): ImageSize {
  if (size.width <= 0) throw new Error(`width must be greater than 0`)
  if (size.height <= 0) throw new Error(`height must be greater than 0`)
  if (bounds.width <= 0) throw new Error(`bounds width must be greater than 0`)
  if (bounds.height <= 0)
    throw new Error(`bounds height must be greater than 0`)

  // if size is smaller than bounds leave it alone
  if (size.width < bounds.width && size.height < bounds.height) {
    return size
  }

  const aspect = size.width / size.height
  const boundsAspect = bounds.width / bounds.height

  if (aspect > boundsAspect) {
    // src is wider than inside so constrain by width
    return {
      width: bounds.width,
      height: Math.max(1, Math.round(bounds.width / aspect)),
    }
  } else {
    // src is taller than inside so constrain by height
    return {
      width: Math.max(1, Math.round(bounds.height * aspect)),
      height: bounds.height,
    }
  }
}

const BIG_DIMENSION = 100000

export const resizeInWidth = (size: ImageSize, width: number) =>
  resizeIn(size, { width, height: BIG_DIMENSION })

export const resizeInHeight = (size: ImageSize, height: number) =>
  resizeIn(size, { width: BIG_DIMENSION, height })
