import chai, { expect } from "chai"
import chaiHttp from "chai-http"
import app from "../src/app"
import { DictionaryApiOutput } from "../src/types"

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

describe("app.js", () =>
{
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
})

describe("dictionary", () =>
{
  it("can find base forms with kanji", async () =>
  {
    const response = await get("/dictionary/" + encodeURIComponent("食べる"))
    expect(response).to.have.status(200)

    const thing = response.body as DictionaryApiOutput[]

    expect(thing).to.be.an("array")
      .that.satisfies((arr: DictionaryApiOutput[]) =>
        arr.some(entry =>
          entry.glosses.some(gloss =>
            gloss == "（１）食物を口に入れ，かんで飲み込む。現在では「食う」よりは上品な言い方とされる。「果物を―・べる」「朝食を―・べる」"))) // from daijirin
      .and.satisfies((arr: DictionaryApiOutput[]) =>
        arr.some(entry =>
          entry.glosses.some(gloss =>
            gloss == "to eat"))) // from edict
  }),
  it("only non conjugated lemmas are returned", async () =>
  {
    const response = await get("/dictionary/" + encodeURIComponent("食べた"))

    const body = response.body as DictionaryApiOutput[]
    expect(body).to.have.lengthOf(1)
    expect(body[0].lemmas)
      .to.be.deep.equal(["食べる（たべる）","喰べる（たべる）"])
  })
})