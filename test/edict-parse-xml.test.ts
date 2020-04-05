import { edictXmlParse } from "../src/edict/edict-parse"
import { uniq, to } from "../src/utils"
import { expect } from "chai"
import { Lemma } from "../src/types"

describe("edict-parse-xml", function () {
  this.timeout(1000000)
  it("can parse the xml", async () => {
    for await (const val of edictXmlParse()) {

      expect(val.entrySequence).to.be.a("number")
      console.log(val)

      expect(val.lemmas).to.be.an("array").that.is.not.empty

      val.lemmas.forEach(l => {
        expect(l.kanji).to.be.a("string")
        expect(l.reading).to.be.a("string")
        expect(l.isConjugated).to.be.a("boolean")
      })

      // No duplicates in lemmas
      const stringifiedUnconjugatedReadingLinks: string[]
        = val.lemmas.map(l => "k" + l.kanji + "r" + l.reading)

      expect(uniq(stringifiedUnconjugatedReadingLinks).length)
        .to.be.equal(val.lemmas.length)

      if (val.entrySequence == 1002020) {
        // Test re_restr
        expect(val.lemmas).to.be.deep.equal(to<Lemma[]>([
          { kanji: "お歯黒", reading: "おはぐろ", isConjugated: false },
          { kanji: "御歯黒", reading: "おはぐろ", isConjugated: false },
          { kanji: "鉄漿", reading: "おはぐろ", isConjugated: false },
          { kanji: "鉄漿", reading: "かね", isConjugated: false },
          { kanji: "鉄漿", reading: "てっしょう", isConjugated: false },
        ]))
      }

      if (val.entrySequence == 1358280) {
        // Test conjugation
        expect(val.lemmas).to.deep.contain(to<Lemma>({
          kanji: "食べた",
          reading: "たべた",
          isConjugated: true,
        }))
      }
    }
  })
})