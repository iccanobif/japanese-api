import { getDictionaryEntries, getEntriesForWordInOffset } from "../src/services"
import { expect } from "chai"
import { MongoClient } from "mongodb"
import { environment } from "../src/environment"
import { Repository } from "../src/repository"

let client: MongoClient = new MongoClient(environment.mongodbUrl)

describe("edict-repository", function ()
{
  let repository: Repository
  this.timeout(10000)
  before(async () =>
  {
    await client.connect()
    const db = client.db()
    repository = new Repository(db)
  })
  it("食べる", async () =>
  {
    const entries = await getDictionaryEntries(repository, "食べる")
    expect(entries).to.be.an("array").that.is.not.empty
    for (const entry of entries)
    {
      for (const japaneseGloss of entry.japaneseGlosses)
        expect(japaneseGloss).not.to.match(/→英和$/)
    }
    expect(entries[0].englishGlosses).to.include("eat;→英和")
  })
  it("いっその事", async () =>
  {
    const entries = await getDictionaryEntries(repository, "いっその事")
    expect(entries).to.be.an("array").that.is.not.empty
  })
  it("仰って", async () =>
  {
    const entries = await getDictionaryEntries(repository, "仰って")
    expect(entries).to.be.an("array").that.is.not.empty
  })
  it("separates english glosses from japanese glosses", async () => 
  {
    const entries = await getDictionaryEntries(repository, "悶える")
    expect(entries).to.be.an("array").that.is.not.empty
    for (const entry of entries)
    {
      for (const japaneseGloss of entry.japaneseGlosses)
        expect(japaneseGloss).not.to.match(/agonized/)
    }
    expect(entries[0].englishGlosses).to.include("be agonized.")
  })
  it("can search words in sentence by offset ignoring furigana", async () => {
    const query = "俺が朝目覚めて夜｜眠《ねむ》るまでのこのフツーな世界に比べて"
    const entries = await getEntriesForWordInOffset(repository, query, 10)
    expect(entries[0].lemmas.map(l => l.kanji)).to.include("眠る")
  })
  after(() => (client.close()))
})