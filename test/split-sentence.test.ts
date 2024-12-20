import { expect } from "chai"
import { splitSentence, wordExists, getSubstringsIncludingPosition } from "../src/split-sentence"
import { MongoClient, Collection } from "mongodb"
import { environment } from "../src/environment"
import { DictionaryEntryInDb } from "../src/types"

let client: MongoClient = new MongoClient(environment.mongodbUrl)

describe("split sentence", function () {
  let dictionary: Collection<DictionaryEntryInDb>
  this.timeout(10000)
  before(async () => {
    await client.connect()
    const db = client.db()
    dictionary = db.collection<DictionaryEntryInDb>("dictionary")
  })
  it("can figure out if a word exists or not", async () => {
    expect(await wordExists(dictionary, "食べる")).to.be.true
    expect(await wordExists(dictionary, "asdfghweqrewuiofsd")).to.be.false
  })
  it("splits a simple sentence", async () => {
    const results = await splitSentence(dictionary, "これはテストです")
    expect(results).to.deep.equal(["これは", "テスト", "です"])
  })
  it("do not split single words", async () => {
    const results = await splitSentence(dictionary, "食べる")
    expect(results).to.deep.equal(["食べる"])
  })
  it("handles corner cases correctly", async () => {
    expect(await splitSentence(dictionary, "")).to.deep.equal([])
    expect(await splitSentence(dictionary, "à")).to.deep.equal(["à"])
    expect(await splitSentence(dictionary, "あ")).to.deep.equal(["あ"])
  })
  it("is flexible with receiving hiragana/katakana/romaji", async () => {
    const results = await splitSentence(dictionary, "korehaてすとデス")
    expect(results).to.deep.equal(["koreha", "てすと", "デス"])
  })
  it("ignores whitespace and punctuation", async () => {
    const results = await splitSentence(dictionary, "これは　テスト　です。")
    expect(results).to.deep.equal(["これは", "テスト", "です"])
  })
  it("ウケ狙い should not be split", async () => {
    const results = await splitSentence(dictionary, "ウケ狙い")
    expect(results).to.deep.equal(["ウケ狙い"])
  })
  // it("prioritize は for splitting", async () =>
  // {
  //   const results = await splitSentence(dictionary, "ご注文はうさぎですか")
  //   expect(results).to.deep.equal(["ご注文", "は", "うさぎ", "ですか"])
  // })
  after(() => (client.close()))
})

describe("getSubstrings", function () {
  it("works :)", () => {
    expect(getSubstringsIncludingPosition("abcdefg", 2)).to.deep.equal(
      [
        'abcdefg',
        'abcdef',
        'abcde',
        'abcd',
        'abc',
        'bcdefg',
        'bcdef',
        'bcde',
        'bcd',
        'bc',
        'cdefg',
        'cdef',
        'cde',
        'cd',
        'c',
      ])
  })
  it("counts whitespace and punctuation marks as word separators", () => {
    for (const separator of ['.', ',', '。', '、', ' ']) {
      expect(getSubstringsIncludingPosition(`abc${separator}def`, 0)).to.deep.equal(['abc', 'ab', 'a']);
      expect(getSubstringsIncludingPosition(`abc${separator}def`, 1)).to.deep.equal(['abc', 'ab', 'bc', 'b']);
      expect(getSubstringsIncludingPosition(`abc${separator}def`, 2)).to.deep.equal(['abc', 'bc', 'c']);
      expect(getSubstringsIncludingPosition(`abc${separator}def`, 3)).to.deep.equal([]);
      expect(getSubstringsIncludingPosition(`abc${separator}def`, 4)).to.deep.equal(['def', 'de', 'd']);
      expect(getSubstringsIncludingPosition(`abc${separator}def`, 5)).to.deep.equal(['def', 'de', 'ef', 'e']);
      expect(getSubstringsIncludingPosition(`abc${separator}def`, 6)).to.deep.equal(['def', 'ef', 'f']);
    }
  })
  it("doesn't output strings longer than 50 characters", () => {
    let s = ""
    for (let i = 0; i < 100; i++)
      s += "a"
    const results = getSubstringsIncludingPosition(s, 50)
    for (const r of results)
      expect(r.length).to.be.lessThan(51)
  })
})