import { expect } from "chai"
import { getKanjidicEntry } from "../src/kanjidic"

describe("kanjidic", function ()
{
  it("家 stroke count", async () =>
  {
    const results = getKanjidicEntry("家")
    expect(results).to.have.property("strokeCount", 10)
  })
})