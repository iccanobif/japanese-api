import chai, { expect } from "chai"
import chaiHttp from "chai-http"
import app, { setAppDatabase } from "../src/app"
import { ApiWordOutput, ApiSentenceOutput } from "../src/types"
import { MongoClient } from "mongodb"
import { environment } from "../src/environment"

chai.use(chaiHttp)

function get(path: string): Promise<ChaiHttp.Response>
{
  return new Promise((resolve, reject) =>
  {
    const agent = chai.request(app)
    agent.get(path).end((err, res) =>
    {
      if (err) reject(err)
      else resolve(res)
    })
  })
}

let client: MongoClient

describe("app.js", function ()
{
  this.timeout(10000)
  before(async () =>
  {
    client = new MongoClient(environment.mongodbUrl,
      {
        autoReconnect: false,
        useUnifiedTopology: true
      })
    await client.connect()
    setAppDatabase(client.db())
  })

  it("GET /", (done) =>
  {
    const agent = chai.request(app)
    agent
      .get("/")
      .end((err, res) =>
      {
        if (err) done(err)
        expect(res).to.have.status(200)
        done()
      })
  })


  describe("word", () =>
  {
    it("can find base forms with kanji", async () =>
    {
      const response = await get("/word/" + encodeURIComponent("食べる"))
      expect(response).to.have.status(200)

      const thing = response.body as ApiWordOutput[]

      expect(thing).to.be.an("array")
        .that.satisfies((arr: ApiWordOutput[]) =>
          arr.some(entry =>
            entry.japaneseGlosses.some(gloss =>
              gloss == "（１）食物を口に入れ，かんで飲み込む。現在では「食う」よりは上品な言い方とされる。「果物を―・べる」「朝食を―・べる」"))) // from daijirin
        .and.satisfies((arr: ApiWordOutput[]) =>
          arr.some(entry =>
            entry.englishGlosses.some(gloss =>
              gloss == "to eat"))) // from edict
    })
    it("only non conjugated lemmas are returned", async () =>
    {
      const response = await get("/word/" + encodeURIComponent("食べた"))

      const body = response.body as ApiWordOutput[]
      expect(body).to.have.lengthOf(1)
      expect(body[0].lemmas)
        .to.be.deep.equal([{
          "kanji": "食べる",
          "reading": "たべる"
        },
        {
          "kanji": "喰べる",
          "reading": "たべる"
        }])
    })
    it("can find searching by romaji (taberu)", async () =>
    {
      const responseRomaji = await get("/word/taberu")
      const responseKanji = await get("/word/" + encodeURIComponent("食べる"))
      expect(responseRomaji).to.have.status(200)
      expect(responseKanji).to.have.status(200)
      expect(responseRomaji.body).to.deep.equal(responseKanji.body)
    })
    it("can find searching by romaji (ijou)", async () =>
    {
      const responseRomaji = await get("/word/ijou")
      const responseKanji = await get("/word/" + encodeURIComponent("いじょう"))
      expect(responseRomaji).to.have.status(200)
      expect(responseKanji).to.have.status(200)
      expect(responseRomaji.body).to.deep.equal(responseKanji.body)
    })
    it("can find katakana lemmas", async () =>
    {
      const response = await get("/word/" + encodeURIComponent("テスト"))
      expect(response).to.have.status(200)
      expect(response.body).to.have.lengthOf(1)
    })
    it("can find word ロボット by offset", async () =>
    {
      const response = await get("/word/" + encodeURIComponent("ロボット") + "/1")
      expect(response).to.have.status(200)
      expect(response.body).not.to.have.lengthOf(0)
    })
    it("sort results by relevance", async () => 
    {
      const response = await get("/word/" + encodeURIComponent("見出し"))
      expect(response).to.have.status(200)
      const a = response.body[0] as ApiWordOutput
      expect(a.lemmas).to.deep.include({ kanji: '見出し', reading: 'みだし' })
    })
    it("sort results by offset", async () =>
    {
      const response = await get("/word/" + encodeURIComponent("死体が散乱していた") + "/4")
      expect(response).to.have.status(200)
      const results = response.body as ApiSentenceOutput[]
      expect(results[0].word).to.equal("散乱")
    })
    it("has 'part of speech' info", async () =>
    {
      const response = await get("/word/" + encodeURIComponent("食べる"))
      expect(response).to.have.status(200)
      const results = response.body[0] as ApiWordOutput
      expect(results.partOfSpeech).to.deep.equal(["v1", "vt"])
    })
    // Comment this test for now because i'm not sure it's even correct (ignoring re_nokanji readings would be okay for 嘘,
    // but it would break other words, that for example have only one reading which happens to be re_nokanji, like 尼羅)
    // it("has no duplicate or redundant lemmas (ignore re_nokanji reading elements from JMdict)", async () =>
    // {
    //   const response = await get("/word/" + encodeURIComponent("嘘"))
    //   expect(response).to.have.status(200)
    //   const results = response.body[0] as ApiWordOutput
    //   expect(results.lemmas).to.deep.equal([{ kanji: "嘘", reading: "うそ" }, { kanji: "噓", reading: "うそ" }])
    // })
    it("sorts items by how common the kanji that was searched was for that particular word", async () => 
    {
      const response = await get("/word/" + encodeURIComponent("目標"))
      expect(response).to.have.status(200)
      const results = response.body as ApiWordOutput[]
      expect(results[0].lemmas).to.deep.equal([{ kanji: '目標', reading: 'もくひょう' }])
      expect(results[1].lemmas).to.deep.include([{ kanji: '目標', reading: 'めじるし' }])
    })
  })

  describe("sentence", () =>
  {
    it("can split a sentence and return dictionary definitions for each word", async () =>
    {
      const response = await get("/sentence/" + encodeURIComponent("これはテストです"))
      expect(response).to.have.status(200)

      const actualOutput = response.body as ApiSentenceOutput[]
      expect(actualOutput).to.be.an("array").that.is.not.empty

      expect(actualOutput[0].word).to.equal("これは")
      expect(actualOutput[1].word).to.equal("テスト")
      expect(actualOutput[2].word).to.equal("です")
    })
    it("works properly either with romaji or kana", async () =>
    {
      const responseKana = await get("/sentence/" + encodeURIComponent("つぼ"))
      const responseRomaji = await get("/sentence/tubo")
      expect(responseKana).to.have.status(200)
      expect(responseRomaji).to.have.status(200)

      const kanaOutput = responseKana.body as ApiSentenceOutput[]
      const romajiOutput = responseRomaji.body as ApiSentenceOutput[]

      expect(kanaOutput.map(o => o.dictionaryEntries)).to.deep.equal(romajiOutput.map(o => o.dictionaryEntries))
    })
  })

  describe("radical lookup", () =>
  {
    it("can find 家", async () =>
    {
      const response = await get("/kanji-by-radical/roof,pig")
      const body = response.body as string[]
      expect(body).to.deep.equal(
        [
          '家', '窘', '嫁', '寝', '寢',
          '稼', '糘', '邃', '疉', '傢',
          '宐', '宭', '寁', '寖', '濅',
          '鎵', '𨗉'
        ]
      )
    })
  })

  describe("accents", () =>
  {
    it("doesn't include sample sentences in the accents list", async () =>
    {
      const response = await get("/word/" + encodeURIComponent("あやふや"))
      expect(response).to.have.status(200)
      const a = response.body[0] as ApiWordOutput
      expect(a.accents).to.deep.equal(["アヤフヤ [0]"])
    })
    it("populates example sentences list", async () =>
    {
      const response = await get("/word/" + encodeURIComponent("あやふや"))
      expect(response).to.have.status(200)
      const a = response.body[0] as ApiWordOutput
      expect(a.sampleSentences).to.deep.equal(["アヤフヤナ返事"])
    })
    it("returns correct accent for 雨 (ア↓メ [1])", async () =>
    {
      const response = await get("/word/" + encodeURIComponent("雨"))
      expect(response).to.have.status(200)
      const a = response.body[0] as ApiWordOutput
      expect(a.accents).to.deep.equal(["ア↓メ [1]"])
    })
    it("returns correct accent for 飴 (アメ [0])", async () =>
    {
      const response = await get("/word/" + encodeURIComponent("飴"))
      expect(response).to.have.status(200)
      const a = response.body[0] as ApiWordOutput
      expect(a.accents).to.deep.equal(["アメ [0]"])
    })
  })

  after(() =>
  {
    client.close()
  })
})
