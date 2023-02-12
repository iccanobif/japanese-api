import { DictionaryEntryInDb, Lemma } from "../src/types"
import { expect } from "chai"
import { MongoClient, Collection } from "mongodb";
import { environment } from "../src/environment";

let client: MongoClient = new MongoClient(environment.mongodbUrl)
describe("database tests", function ()
{
  let dictionary: Collection<DictionaryEntryInDb>
  this.timeout(10000)
  before(async () =>
  {
    await client.connect()
    const db = client.db()
    dictionary = db.collection<DictionaryEntryInDb>("dictionary")
  })
  describe("stuff depending on edict", function ()
  {
    it("has no empty unconjugatedReadingLinks", async () =>
    {
      const document = await dictionary.findOne({ "lemmas.kanji": "お歯黒" })

      expect(document).to.exist
      if (!document) return // This is here just to convince typescript that document really isn't null or undefined

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
      it("has conjugated terms", async () =>
      {
        const count = await dictionary.find({ allKeys: "食べた" }).count()
        expect(count).to.equal(1)
      }),
      it("has no entry without lemmas", async () =>
      {
        const document = await dictionary.findOne({ lemmas: [] })
        expect(document).to.be.null
      }),
      it("has no entry without 'allKeys'", async () =>
      {
        const document = await dictionary.findOne({ allKeys: null } as any)
        expect(document).to.be.null
      })
  })
  describe("stuff depending on daijirin", function ()
  {
    // it("merged lines beginning with → with the previous one (lemma)", async () => {
    //   const document = await doOnMongoCollection<DictionaryEntryInDb>("dictionary",
    //     coll => coll.findOne({ allKeys: "ANZCERTA" })
    //   ) as DictionaryEntryInDb

    //   expect(document).not.to.be.null
    //   expect(document.daijirinLemmas).to.deep.equal(["ANZCERTA 〖AustraliaNew Zealand Closer Economic Relationship Treaty Agreement〗→CER"])
    // }),
    // it("merged lines beginning with → with the previous one (glosses)", async () => {
    //   const document = await doOnMongoCollection<DictionaryEntryInDb>("dictionary",
    //     coll => coll.findOne({ allKeys: "ATB" })
    //   ) as DictionaryEntryInDb

    //   expect(document).not.to.be.null
    //   expect(document.daijirinGlosses).to.deep.equal(["オール-テレイン-バイク。全地形型バイク。→MTB"])
    // })
    it("doesn't have duplicate daijirin articles", async () =>
    {
      const document = await dictionary.findOne({ allKeys: "食べた" })
      expect(document).to.exist
      if (!document) return // This is here just to convince typescript that document really isn't null or undefined

      expect(document.daijirinArticles).to.have.lengthOf(2)
      const bilingualDoc = document.daijirinArticles.find(a => a.lemma == "たべる【食べる】")
      const monolingualDoc = document.daijirinArticles.find(a => a.lemma != "たべる【食べる】")

      expect(bilingualDoc).to.exist
      expect(monolingualDoc).to.exist
    })
    it("doesn't have stray html entities", async () =>
    {
      const document = await dictionary.findOne({ "daijirinArticles.glosses": /&lt;/})
      expect(document).to.equal(null)
    })
  })
  after(() => (client.close()))
})