import { expect } from "chai"
import { toHiragana } from "../src/kana-tools"

describe("kana-tools", function ()
{
  it("katakana to hiragana, romaji to hiragana", async () =>
  {
    const results = toHiragana("カタカナtesuto鬱12")
    expect(results).to.equal("かたかなてすと鬱12")
  })
})