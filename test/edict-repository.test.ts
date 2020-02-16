import { getDictionaryEntries } from "../src/edict/repository"
import { expect } from "chai"

describe("edict-repository", function () {
  it("食べる", async () => {
    const entries = await getDictionaryEntries("食べる")
    expect(entries).to.be.an("array").that.is.not.empty
  })
})