// import { daijirinParse } from "../src/daijirin/daijirin-parse"
// import { DaijirinEntryFromFile } from "../src/types"
// import { expect } from "chai"

// describe("daijirin parse", function () {
//   this.timeout(500000)
//   it("can parse", async () => {
//     const firstValue = (await daijirinParse().next()).value as DaijirinEntryFromFile
//     expect(firstValue.key).to.equal("&")
//     expect(firstValue.lemma).to.equal("& （アンパサンド） 〖ampersand〗")
//     expect(firstValue.glosses).to.be.deep.equal(["英語の「and」の意を表す記号。…と。そして。"])

//     for await (const val of daijirinParse()) {
//       expect(val.glosses).to.be.an("array")
//       expect(val.lemma).not.to.be.empty
//       expect(val.key).not.to.be.empty

//       // val.glosses.forEach(gloss =>
//       //   expect(gloss).to.be.a("string").and.match(/^[^→]/))
//     }
//   })
// })


// // shit, there are entries with the same key (ex. AALA)...