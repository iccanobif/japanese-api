import { getDictionaryEntries } from "../src/edict/repository"
import { expect } from "chai"
import { MongoClient, Collection } from "mongodb"
import { environment } from "../src/environment"
import { DictionaryEntryInDb } from "../src/types"

let client: MongoClient = new MongoClient(environment.mongodbUrl,
  {
    autoReconnect: false,
    useUnifiedTopology: true
  })

describe("edict-repository", function ()
{
  let dictionary: Collection<DictionaryEntryInDb>
  this.timeout(10000)
  before(async () =>
  {
    await client.connect()
    const db = client.db()
    dictionary = db.collection<DictionaryEntryInDb>("dictionary")
  })
  it("食べる", async () =>
  {
    const entries = await getDictionaryEntries(dictionary, "食べる")
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
    const entries = await getDictionaryEntries(dictionary, "いっその事")
    expect(entries).to.be.an("array").that.is.not.empty
  })
  it("仰って", async () =>
  {
    const entries = await getDictionaryEntries(dictionary, "仰って")
    expect(entries).to.be.an("array").that.is.not.empty
  })
  after(() => (client.close()))
})