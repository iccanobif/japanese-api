import { edictXmlParse } from "../src/edict/parse-xml"
import { EdictEntryFromFile } from "../src/edict/types"
import { uniq } from "../src/utils"
import { expect } from "chai"

describe("edict-parse-xml", () => {
  it("can parse the xml", async () => {
    const everything: EdictEntryFromFile[] = []
    for await (const val of edictXmlParse())
    {
      console.log(val)
      val.unconjugatedReadingLinks.forEach(l => {
        expect(l.kanjiElement).to.be.a("string")
        expect(l.readingElement).to.be.a("string")
      })
      
      // No duplicates in val.unconjugatedReadingLinks
      const stringifiedUnconjugatedReadingLinks: string[]
        = val.unconjugatedReadingLinks.map(l => "k" + l.kanjiElement + "r" + l.readingElement)

      expect(uniq(stringifiedUnconjugatedReadingLinks).length)
        .to.be.equal(val.unconjugatedReadingLinks.length)
      
      // everything.push(val)
    }
  })
})