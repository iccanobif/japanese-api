import { expect } from "chai"
import { splitSentence, wordExists } from "../src/split-sentence"
import { MongoClient, Collection } from "mongodb"
import { environment } from "../src/environment"
import { DictionaryEntryInDb } from "../src/types"

let client: MongoClient = new MongoClient(environment.mongodbUrl,
  {
    autoReconnect: false,
    useUnifiedTopology: true
  })


describe("split sentence", function ()
{
  let dictionary: Collection<DictionaryEntryInDb>
  before(async () =>
  {
    await client.connect()
    const db = client.db()
    dictionary = db.collection<DictionaryEntryInDb>("dictionary")
  })
  it("can figure out if a word exists or not", async () => {
    expect(await wordExists(dictionary, "食べる")).to.be.true
    expect(await wordExists(dictionary, "asdfghweqrewuiofsd")).to.be.false
  })
  it("splits a simple sentence", async () =>
  {
    const results = await splitSentence(dictionary, "これはテストです")
    expect(results).to.deep.equal(["これは", "テスト", "です"])
  })
  it("do not split single words", async () =>
  {
    const results = await splitSentence(dictionary, "食べる")
    expect(results).to.deep.equal(["食べる"])
  })
  it("handles corner cases correctly", async () =>
  {
    expect(await splitSentence(dictionary, "")).to.deep.equal([])
    expect(await splitSentence(dictionary, "à")).to.deep.equal(["à"])
    expect(await splitSentence(dictionary, "あ")).to.deep.equal(["あ"])
  })
  after(() => (client.close()))
})