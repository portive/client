import { Client } from ".."

describe("Client", () => {
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
