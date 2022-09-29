export function promised<T>(value: T) {
  return new Promise((resolve) => {
    resolve(value)
  })
}
