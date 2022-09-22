/**
 * @jest-environment jsdom
 */
/**
 * DO NOT REMOVE @jest-environment jsdom above. This allows us to get fake
 * `File` objects that we can use in Node.js for testing. These usually only
 * exist in the browser.
 */
/* Disable checking for `any` to allow for bad types to force errors in tests */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* Disable checking for `require` as we need it to make mocking of fetch work */
/* eslint-disable @typescript-eslint/no-var-requires */
import axios from "axios"
import {
  Client,
  createClientFile,
  getUploadPolicy,
  getUploadPolicyFromClientFileInfo,
  uploadFile,
} from "../.."
import { createAuthToken } from "@portive/auth"
import { promised } from "./test-utils"

jest.mock("axios")
const $axios = jest.mocked(axios, true)

function noop() {
  /* noop */
  return {}
}

if (typeof window.URL.createObjectURL === "undefined") {
  Object.defineProperty(window.URL, "createObjectURL", { value: noop })
}

describe("fetchUploadPolicy", () => {
  beforeEach(() => {
    $axios.post.mockReset()
  })

  const textFile = new File([new ArrayBuffer(26)], "alphabet.txt", {
    type: "text/plain",
  })
  const helloFile = new File([new ArrayBuffer(5)], "hello.txt", {
    type: "text/plain",
  })

  it("should get client file and return a reference equal object if provided the same file", async () => {
    const clientFile1 = await createClientFile(textFile)
    expect(clientFile1).toEqual({
      type: "generic",
      filename: "alphabet.txt",
      contentType: "text/plain",
      bytes: 26,
      file: expect.any(File),
      objectUrl: {},
    })

    const clientFile2 = await createClientFile(textFile)
    expect(clientFile1 === clientFile2).toBe(true)

    const helloClientFile = await createClientFile(helloFile)
    expect(clientFile1 === helloClientFile).toBe(false)
  })

  it("should get an upload policy from client file info", async () => {
    const authToken = createAuthToken(
      "PRTV_aaaaaaaaaaaaaaaa_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      {
        expiresIn: 60 * 60,
        path: "**/*",
      }
    )
    const client = new Client({
      authToken,
      apiOrigin: "https://api.fake-unit-test-endpoint.for.cloud",
    })

    $axios.post.mockResolvedValueOnce(
      promised({
        status: "success",
        data: {
          type: "image",
          size: [1024, 1536],
          url: "https://files.dev.for.cloud/f/on/2022/06/14/8emyw16knref9ht665fme--1024x1536.jpg",
        },
      })
    )

    const result = await getUploadPolicyFromClientFileInfo({
      client,
      clientFileInfo: {
        type: "generic",
        filename: "alphabet.txt",
        contentType: "text/plain",
        bytes: 26,
      },
    })

    const axiosArgs = $axios.post.mock.calls[0]
    expect(axiosArgs[0]).toEqual(
      "https://api.fake-unit-test-endpoint.for.cloud/api/v1/upload"
    )
    expect(axiosArgs[1]).toMatchObject({
      clientFileInfo: {
        type: "generic",
        filename: "alphabet.txt",
        contentType: "text/plain",
        bytes: 26,
      },
    })

    expect(result).toEqual({
      type: "image",
      size: [1024, 1536],
      url: "https://files.dev.for.cloud/f/on/2022/06/14/8emyw16knref9ht665fme--1024x1536.jpg",
    })
  })

  it("should get an upload policy", async () => {
    const authToken = createAuthToken(
      "PRTV_aaaaaaaaaaaaaaaa_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      {
        expiresIn: 60 * 60,
        path: "**/*",
      }
    )
    const client = new Client({
      authToken,
      apiOrigin: "https://api.fake-unit-test-endpoint.for.cloud",
    })

    $axios.post.mockResolvedValueOnce(
      promised({
        status: "success",
        data: {
          type: "image",
          size: [1024, 1536],
          url: "https://files.dev.for.cloud/f/on/2022/06/14/8emyw16knref9ht665fme--1024x1536.jpg",
        },
      })
    )

    const result = await getUploadPolicy({
      client,
      file: textFile,
    })

    const axiosArgs = $axios.post.mock.calls[0]
    expect(axiosArgs[0]).toEqual(
      "https://api.fake-unit-test-endpoint.for.cloud/api/v1/upload"
    )
    expect(axiosArgs[1]).toMatchObject({
      clientFileInfo: {
        type: "generic",
        filename: "alphabet.txt",
        contentType: "text/plain",
        bytes: 26,
      },
    })

    expect(result).toEqual({
      type: "image",
      size: [1024, 1536],
      url: "https://files.dev.for.cloud/f/on/2022/06/14/8emyw16knref9ht665fme--1024x1536.jpg",
    })
  })

  it("should upload a file", async () => {
    const authToken = createAuthToken(
      "PRTV_aaaaaaaaaaaaaaaa_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      {
        expiresIn: 60 * 60,
        path: "**/*",
      }
    )
    const client = new Client({
      authToken,
      apiOrigin: "https://api.fake-unit-test-endpoint.for.cloud",
    })

    $axios.post
      .mockResolvedValueOnce(
        promised({
          /**
           * `axios` returns its response in a `data` property. Within that
           * `data` property, note that the response from the server also
           * has a `data` property. This is expected.
           */
          data: {
            status: "success",
            data: {
              apiUrl: "https://s3.amazonaws.com/portive-dev-bucket",
              fileUrl:
                "https://files.dev.for.cloud/f/on/2022/06/14/lrvexhununqz70xgb577m.txt",
              formFields: {
                acl: "public-read",
                key: "f/on/2022/06/14/lrvexhununqz70xgb577m.txt",
                bucket: "portive-dev-bucket",
                "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
                "X-Amz-Credential":
                  "AKIA_FAKE_CREDENTIALS/20220614/us-east-1/s3/aws4_request",
                "X-Amz-Date": "20220614T214521Z",
                Policy: "VERY_LONG_POLICY",
                "X-Amz-Signature":
                  "0b34e122084b437a42bc540a833bdadcddd5fcc8b54b0336485e755608a299b4",
              },
            },
          },
        })
      )
      .mockResolvedValueOnce(promised({ status: 204 }))

    const result = await uploadFile({
      client,
      file: textFile,
    })

    expect(result).toEqual({
      status: "success",
      data: {
        type: "generic",
        url: "https://files.dev.for.cloud/f/on/2022/06/14/lrvexhununqz70xgb577m.txt",
      },
    })

    const policyArgs = $axios.post.mock.calls[0]
    expect(policyArgs[0]).toEqual(
      "https://api.fake-unit-test-endpoint.for.cloud/api/v1/upload"
    )
    expect(policyArgs[1]).toMatchObject({
      clientFileInfo: {
        type: "generic",
        filename: "alphabet.txt",
        contentType: "text/plain",
        bytes: 26,
      },
    })

    const uploadArgs = $axios.post.mock.calls[1]
    expect(uploadArgs[0]).toEqual("https://s3.amazonaws.com/portive-dev-bucket")
    expect(uploadArgs[1]).toEqual(expect.any(FormData))
    expect(uploadArgs[2]).toEqual({ onUploadProgress: expect.any(Function) })
  })
})
