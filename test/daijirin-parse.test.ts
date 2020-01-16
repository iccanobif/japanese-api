import { daijirinParse } from "../src/daijirin/daijirin-parse"
import { DaijirinEntryFromFile } from "../src/edict/types"
import { expect } from "chai"

describe("daijirin parse", function () {
  this.timeout(50000)
  it("can parse", async () => {
    const firstValue = (await daijirinParse().next()).value as DaijirinEntryFromFile
    expect(firstValue.lemma).to.equal("&")
    expect(firstValue.gloss).to.equal("& （アンパサンド） 〖ampersand〗<br/>英語の「and」の意を表す記号。…と。そして。<br/><br/>")

    for await (const val of daijirinParse())
    {
      expect(val.gloss).not.to.be.empty
      expect(val.lemma).not.to.be.empty
    }
  })
})
