import chai, { expect } from "chai"
import chaiHttp from "chai-http"
import app from "../src/app"

chai.use(chaiHttp)

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