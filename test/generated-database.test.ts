import { doOnMongoCollection } from "../src/utils"
import { DictionaryEntryInDb, Lemma } from "../src/types"
import { expect } from "chai"

describe("generated-database", function () {
  it("has no empty unconjugatedReadingLinks", async () => {
    const coll = await doOnMongoCollection<DictionaryEntryInDb>("dictionary",
      coll => coll.findOne({ "lemmas.kanji": "お歯黒" })
    ) as DictionaryEntryInDb

    const sortLemmas = (lemmas: Lemma[]) => lemmas.sort((a, b) => (a.kanji + a.reading).localeCompare(b.kanji + b.reading))

    const sortedActualLemmas = sortLemmas(coll.lemmas)

    const expectedLemmas = sortLemmas([
      { kanji: "お歯黒", reading: "おはぐろ", isConjugated: false },
      { kanji: "御歯黒", reading: "おはぐろ", isConjugated: false },
      { kanji: "鉄漿", reading: "おはぐろ", isConjugated: false },
      { kanji: "鉄漿", reading: "かね", isConjugated: false },
      { kanji: "鉄漿", reading: "てっしょう", isConjugated: false }
    ])

    expect(sortedActualLemmas).to.deep.equal(expectedLemmas)
  })
})