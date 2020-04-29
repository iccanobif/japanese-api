import { expect } from "chai"
import { toHiragana } from "../src/kana-tools"

describe("kana-tools", function ()
{
  it("katakana to hiragana, romaji to hiragana", async () =>
  {
    const results = toHiragana("カタカナ tesUTo鬱12 tu du cha tya")
    expect(results).to.equal("かたかな てすと鬱12 つ づ ちゃ ちゃ")
  })
})