import chai, { expect } from "chai"
import chaiHttp from "chai-http"
import app from "../src/app"

chai.use(chaiHttp)


function get(path: string): Promise<ChaiHttp.Response> {
  return new Promise((resolve, reject) => {
    const agent = chai.request(app)
    agent.get(path).end((err, res) => {
      if (err) reject(err)
      else resolve(res)
    })
  })
}

describe("app.js", () => {
  it("GET /", (done) => {
    const agent = chai.request(app)
    agent
      .get("/")
      .end((err, res) => {
        if (err) done(err)
        expect(res).to.have.status(200)
        done()
      })
  })
})

describe("dictionary", () => {
  it("can find base forms with kanji", async () => {
    const response = await get("/dictionary/" + encodeURIComponent("食べる"))
    expect(response).to.have.status(200)
    expect(response.body).to.be.an("array").that.is.not.empty
  })
})