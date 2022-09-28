import axios from "axios"
import { Client } from ".."
import { promised } from "../../upload/test/test-utils"

jest.mock("axios")
const $axios = jest.mocked(axios, true)

describe("Client", () => {
  beforeEach(() => {
    $axios.post.mockReset()
  })

  describe("apiKey", () => {
    it("should get apiKey string", async () => {
      const client = new Client({ apiKey: "aaa" })
      expect(await client.getApiKey()).toEqual("aaa")
    })

    it("should get apiKey  a normal function", async () => {
      const client = new Client({ apiKey: () => "aaa" })
      expect(await client.getApiKey()).toEqual("aaa")
    })

    it("should get apiKey from an async function", async () => {
      const client = new Client({ apiKey: async () => "aaa" })
      expect(await client.getApiKey()).toEqual("aaa")
    })
  })

  describe("authToken", () => {
    it("should get authToken string", async () => {
      const client = new Client({ authToken: "aaa" })
      expect(await client.getAuthToken()).toEqual("aaa")
    })

    it("should get authToken from a normal function", async () => {
      const client = new Client({ authToken: () => "aaa" })
      expect(await client.getAuthToken()).toEqual("aaa")
    })

    it("should get authToken from an async function", async () => {
      const client = new Client({ authToken: async () => "aaa" })
      expect(await client.getAuthToken()).toEqual("aaa")
    })
  })

  describe("post apiKey and authKey testing", () => {
    it("should fail if apiKey and authToken are both present", async () => {
      const client = new Client({ apiKey: "API_KEY", authToken: "AUTH_TOKEN" })
      await expect(client.post("/path/to/api", {})).rejects.toThrow(
        "both are defined"
      )
    })

    it("should post if only apiKey is present", async () => {
      const client = new Client({ apiKey: "API_KEY" })

      $axios.post.mockResolvedValueOnce(
        promised({
          status: "success",
          data: {},
        })
      )
      await client.post("/path/to/api", {})
      expect($axios.post.mock.calls.length).toEqual(1)
    })

    it("should post if only apiKey is present", async () => {
      const client = new Client({ authToken: "AUTH_TOKEN" })

      $axios.post.mockResolvedValueOnce(
        promised({
          status: "success",
          data: {},
        })
      )
      await client.post("/path/to/api", {})
      expect($axios.post.mock.calls.length).toEqual(1)
    })
  })
})
