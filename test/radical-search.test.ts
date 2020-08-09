import { expect } from "chai"
import { searchKanjiByRadicalDescriptions } from "../src/radical-search"
import { getKanjidicEntry } from "../src/kanjidic"

describe("radical-search", function ()
{
  it("roof,pig", () =>
  {
    const results = searchKanjiByRadicalDescriptions("roof,pig")

    expect(results).to.be.an("array")
    expect(results).to.include("家")
    expect(results).to.include("嫁")
    expect(results).to.include("𨗉")
    expect(results.indexOf("家")).to.be.lessThan(results.indexOf("嫁"))

    // This condition ensures that the sorting is stable
    for (let i = 0; i < results.length - 1; i++)
    {
      const kanjidicEntry1 = getKanjidicEntry(results[i])
      const kanjidicEntry2 = getKanjidicEntry(results[i + 1])
      if (!kanjidicEntry1 && !kanjidicEntry2)
        expect(results[i].charCodeAt(0)).to.be.lessThan(results[i + 1].charCodeAt(0))
      else if (kanjidicEntry1 && kanjidicEntry2)
        expect(kanjidicEntry1.strokeCount).to.be.lte(kanjidicEntry2.strokeCount)
      else 
      {
        expect(kanjidicEntry1).to.exist
        expect(kanjidicEntry2).to.not.exist
      }
    }
  })
  it("non existing name", () =>
  {
    const results = searchKanjiByRadicalDescriptions("there is no radical with this description")
    expect(results).to.be.an("array").that.is.empty
  })
  it("ignore excessive whitespace", () =>
  {
    const resultsWithSpaces = searchKanjiByRadicalDescriptions("roof , pig")
    const resultsWithoutSpaces = searchKanjiByRadicalDescriptions("roof,pig")
    expect(resultsWithSpaces).to.deep.equal(resultsWithoutSpaces)
  })
  it("has stable sorting", () =>
  {
    const results1 = searchKanjiByRadicalDescriptions("woman,pig")
    const results2 = searchKanjiByRadicalDescriptions("woman,pig,")

    expect(results1).to.deep.equal(results2)
  }),
  it("can find 潜", async () => {
    const results = searchKanjiByRadicalDescriptions("water,big,day")
    expect(results).to.include("潜")
  })
})
