import { resizeIn, resizeInWidth, resizeInHeight } from ".."

describe("resize", () => {
  describe("resizeIn", () => {
    it("should leave an image in bounds alone", async () => {
      const size = resizeIn(
        { width: 500, height: 500 },
        { width: 1000, height: 1000 }
      )
      expect(size).toEqual({ width: 500, height: 500 })
    })

    it("should constrain by width", async () => {
      const size = resizeIn(
        { width: 2000, height: 500 },
        { width: 1000, height: 500 }
      )
      expect(size).toEqual({ width: 1000, height: 250 })
    })

    it("should constrain by height", async () => {
      const size = resizeIn(
        { width: 2000, height: 500 },
        { width: 1000, height: 200 }
      )
      expect(size).toEqual({ width: 800, height: 200 })
    })
    it("should throw if width is too small", async () => {
      expect(() =>
        resizeIn({ width: -1, height: 1000 }, { width: 1000, height: 1000 })
      ).toThrow("width must be greater than 0")
    })
    it("should throw if height is too small", async () => {
      expect(() =>
        resizeIn({ width: 1000, height: -1 }, { width: 1000, height: 1000 })
      ).toThrow("height must be greater than 0")
    })
    it("should throw if bounds width is too small", async () => {
      expect(() =>
        resizeIn({ width: 1000, height: 1000 }, { width: -1, height: 1000 })
      ).toThrow("bounds width must be greater than 0")
    })
    it("should throw if bounds height is too small", async () => {
      expect(() =>
        resizeIn({ width: 1000, height: 1000 }, { width: 1000, height: -1 })
      ).toThrow("bounds height must be greater than 0")
    })
  })

  describe("resizeInWidth", () => {
    it("should leave an image in width alone", async () => {
      const size = resizeInWidth({ width: 500, height: 250 }, 1000)
      expect(size).toEqual({ width: 500, height: 250 })
    })

    it("should constrain by width", async () => {
      const size = resizeInWidth({ width: 500, height: 250 }, 250)
      expect(size).toEqual({ width: 250, height: 125 })
    })
  })

  describe("resizeInHeight", () => {
    it("should leave an image in height alone", async () => {
      const size = resizeInWidth({ width: 500, height: 250 }, 500)
      expect(size).toEqual({ width: 500, height: 250 })
    })

    it("should constrain by height", async () => {
      const size = resizeInHeight({ width: 500, height: 250 }, 125)
      expect(size).toEqual({ width: 250, height: 125 })
    })
  })
})
