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
  })
  it("いっその事", async () =>
  {
    const entries = await getDictionaryEntries(dictionary, "いっその事")
    expect(entries).to.be.an("array").that.is.not.empty
  })
  after(() => (client.close()))
})