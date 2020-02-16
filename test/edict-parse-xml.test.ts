import { edictXmlParse } from "../src/edict/parse-xml"
import { uniq } from "../src/utils"
import { expect } from "chai"

describe("edict-parse-xml", function () {
  this.timeout(1000000)
  it("can parse the xml", async () => {
    for await (const val of edictXmlParse()) {

      expect(val.entrySequence).to.be.a("number")

      val.unconjugatedReadingLinks.forEach(l => {
        expect(l.kanjiElement).to.be.a("string")
        expect(l.readingElement).to.be.a("string")
      })

      val.conjugatedReadingLinks.forEach(l => {
        expect(l.kanjiElement).to.be.a("string")
        expect(l.readingElement).to.be.a("string")
      })

      // No duplicates in val.unconjugatedReadingLinks
      const stringifiedUnconjugatedReadingLinks: string[]
        = val.unconjugatedReadingLinks.map(l => "k" + l.kanjiElement + "r" + l.readingElement)

      expect(uniq(stringifiedUnconjugatedReadingLinks).length)
        .to.be.equal(val.unconjugatedReadingLinks.length)

      if (val.entrySequence == 1002020) {
        // Test re_restr
        expect(val.unconjugatedReadingLinks).to.be.deep.equal([
          { kanjiElement: "お歯黒", readingElement: "おはぐろ" },
          { kanjiElement: "御歯黒", readingElement: "おはぐろ" },
          { kanjiElement: "鉄漿", readingElement: "おはぐろ" },
          { kanjiElement: "鉄漿", readingElement: "かね" },
          { kanjiElement: "鉄漿", readingElement: "てっしょう" },
        ])
      }

      if (val.entrySequence == 1358280) {
        // Test conjugation
        expect(val.conjugatedReadingLinks).to.deep.contain({ kanjiElement: "食べた", readingElement: "たべた" })
      }
    }
  })
})