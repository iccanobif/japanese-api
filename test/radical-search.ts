import { expect } from "chai"
import { searchKanjiByRadicalDescriptions } from "../src/radicals/radical-search"

describe("radical-search", function () {
  it("roof,pig", async () => {
    const results = searchKanjiByRadicalDescriptions("roof,pig")
    expect(results).to.be.an("array")
    expect(results).to.include("家")
    expect(results).to.include("嫁")
  }),
  it("non existing name", async () => {
    const results = searchKanjiByRadicalDescriptions("there is no radical with this description")
    expect(results).to.be.an("array").that.is.empty
  })
})