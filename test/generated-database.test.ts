import { doOnMongoCollection } from "../src/utils"
import { DictionaryEntryInDb } from "../src/types"
import { expect } from "chai"

describe("generated-database", function ()
{
  it("has no empty unconjugatedReadingLinks", async () =>
  {
    const coll = await doOnMongoCollection<DictionaryEntryInDb>("dictionary",
      coll => coll.findOne({lemma: "お歯黒"})
    ) as DictionaryEntryInDb

    expect()
  })
})