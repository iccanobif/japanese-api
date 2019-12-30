import chai, { expect } from "chai"
import chaiHttp from "chai-http"
import app from "../src/index"

chai.use(chaiHttp)

describe("index.js", () => {
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