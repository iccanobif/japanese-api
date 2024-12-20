import { expect } from "chai"
import { getRadicalsForKanji, searchKanjiByRadicalDescriptions } from "../src/radical-search"
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
  }),
  it("can find 峰 using radical description 'action' instead of 'to go'", async () => {
    // The problem here was the confusion between 攵 (action) and 夂 (to go). Even if they're technically different 
    // radicals (see https://chinese.stackexchange.com/questions/1925/is-there-a-difference-between-%E5%A4%82-and-%E5%A4%8A), 
    // I'll just pretend they're the same, and searching for "action" will match both 攵 and 夂.
    const results = searchKanjiByRadicalDescriptions("mounta,action")
    expect(results).to.include("峰")
  }),
  it("can find kanji by searching radicals that are part of bigger radicals for that kanji", async () => {
    // 窺 is listed as having 見 as a radical, but not 目
    const results = searchKanjiByRadicalDescriptions("eye,roof,big")
    expect(results).to.include("窺")
  }),
  it("person", async () => {
    const results = searchKanjiByRadicalDescriptions("person,one")
    expect(results).to.include("今")
  })
  it("刊", async () => {
    const results = searchKanjiByRadicalDescriptions("sword,ten")
    expect(results).to.include("刊")
  })
  it("艶", async () => {
    const results = searchKanjiByRadicalDescriptions("wrap,cylinder,mouth")
    expect(results).to.include("艶")
  })
  it("search by kanji", async () => {
    const results = searchKanjiByRadicalDescriptions("女")
    expect(results).to.include("女")
    expect(results).to.include("安")
  })
  it("get radicals from kanji", async () => {
    const results = getRadicalsForKanji("家")
    expect(results).to.include("宀")
    expect(results).to.include("豕")
  })
})
