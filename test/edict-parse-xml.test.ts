// import { edictXmlParse } from "../src/edict/edict-parse"
// import { uniq } from "../src/utils"
// import { expect } from "chai"

// describe("edict-parse-xml", function () {
//   this.timeout(1000000)
//   it("can parse the xml", async () => {
//     for await (const val of edictXmlParse()) {
//       // No duplicates in lemmas
//       const stringifiedUnconjugatedReadingLinks: string[]
//         = val.lemmas.map(l => "k" + l.kanji + "r" + l.reading)

//       expect(uniq(stringifiedUnconjugatedReadingLinks).length)
//         .to.be.equal(val.lemmas.length)
//     }
//   })
// })