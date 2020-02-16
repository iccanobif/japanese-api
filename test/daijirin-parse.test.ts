import { daijirinParse } from "../src/daijirin/daijirin-parse"
import { DaijirinEntryFromFile } from "../src/types"
import { expect } from "chai"

describe("daijirin parse", function () {
  this.timeout(500000)
  it("can parse", async () => {
    const firstValue = (await daijirinParse().next()).value as DaijirinEntryFromFile
    expect(firstValue.key).to.equal("&")
    expect(firstValue.lemma).to.equal("& （アンパサンド） 〖ampersand〗")
    expect(firstValue.glosses).to.be.deep.equal(["英語の「and」の意を表す記号。…と。そして。"])

    for await (const val of daijirinParse()) {
      expect(val.glosses).to.be.an("array")
      expect(val.lemma).not.to.be.empty
      expect(val.key).not.to.be.empty

      // val.glosses.forEach(gloss =>
      //   expect(gloss).to.be.a("string").and.match(/^[^→]/))

      if (val.key == "ANZCERTA") // TODO: check that this word does exist in the dataset
      {
        expect(val.lemma).to.equal("ANZCERTA 〖AustraliaNew Zealand Closer Economic Relationship Treaty Agreement〗→CER")
        expect(val.glosses).to.deep.equal([])
      }

      if (val.key == "ATB") // TODO: check that this word does exist in the dataset
      {
        expect(val.lemma).to.equal("ATB 〖allterrain bike〗")
        expect(val.glosses).to.deep.equal(["オール-テレイン-バイク。全地形型バイク。→MTB"])
      }
    }
  })
})


// shit, there are entries with the same key (ex. AALA)...