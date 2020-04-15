import { doOnMongoCollection } from "../src/utils"
import { DictionaryEntryInDb, Lemma } from "../src/types"
import { expect } from "chai"

describe("stuff depending on edict", function () {
  it("has no empty unconjugatedReadingLinks", async () => {
    const document = await doOnMongoCollection<DictionaryEntryInDb>("dictionary",
      coll => coll.findOne({ "lemmas.kanji": "お歯黒" })
    ) as DictionaryEntryInDb

    const sortLemmas = (lemmas: Lemma[]) => lemmas.sort((a, b) => (a.kanji + a.reading).localeCompare(b.kanji + b.reading))

    const sortedActualLemmas = sortLemmas(document.lemmas)

    const expectedLemmas = sortLemmas([
      { kanji: "お歯黒", reading: "おはぐろ", isConjugated: false },
      { kanji: "御歯黒", reading: "おはぐろ", isConjugated: false },
      { kanji: "鉄漿", reading: "おはぐろ", isConjugated: false },
      { kanji: "鉄漿", reading: "かね", isConjugated: false },
      { kanji: "鉄漿", reading: "てっしょう", isConjugated: false }
    ])

    expect(sortedActualLemmas).to.deep.equal(expectedLemmas)
  }),
  it("has conjugated terms", async () => {
    const documents = await doOnMongoCollection<DictionaryEntryInDb>("dictionary",
      coll => coll.find({ allKeys: "食べた" }).toArray()
    ) as DictionaryEntryInDb[]

    expect(documents).to.have.lengthOf(1)
  }),
  it("has no entry without lemmas", async () => {
    const document = await doOnMongoCollection<DictionaryEntryInDb>("dictionary",
      coll => coll.findOne({ lemmas: [] })
    ) as DictionaryEntryInDb

    expect(document).to.be.null
  }),
  it("has no entry without 'allKeys'", async() => {
    const document = await doOnMongoCollection<DictionaryEntryInDb>("dictionary",
      coll => coll.findOne({ allKeys: null } as any)
    ) as DictionaryEntryInDb

    expect(document).to.be.null
  })
})
describe("stuff depending on daijirin", function() {
  it("merged lines beginning with → with the previous one (lemma)", async () => {
    const document = await doOnMongoCollection<DictionaryEntryInDb>("dictionary",
      coll => coll.findOne({ allKeys: "ANZCERTA" })
    ) as DictionaryEntryInDb

    expect(document).not.to.be.null
    expect(document.daijirinLemmas).to.deep.equal(["ANZCERTA 〖AustraliaNew Zealand Closer Economic Relationship Treaty Agreement〗→CER"])
  }),
  it("merged lines beginning with → with the previous one (glosses)", async () => {
    const document = await doOnMongoCollection<DictionaryEntryInDb>("dictionary",
      coll => coll.findOne({ allKeys: "ATB" })
    ) as DictionaryEntryInDb

    expect(document).not.to.be.null
    expect(document.daijirinGlosses).to.deep.equal(["オール-テレイン-バイク。全地形型バイク。→MTB"])
  })
})