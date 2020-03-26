import { getDictionaryEntries } from "../src/edict/repository"
import { expect } from "chai"

describe("edict-repository", function () {
  it("食べる", async () => {
    const entries = await getDictionaryEntries("食べる")
    expect(entries).to.be.an("array").that.is.not.empty
  }),
  it("いっその事", async () => {
    const entries = await getDictionaryEntries("いっその事")
    expect(entries).to.be.an("array").that.is.not.empty
  })
})