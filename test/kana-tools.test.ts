import { expect } from "chai"
import { toHiragana } from "../src/kana-tools"

describe("kana-tools", function ()
{
  it("katakana to hiragana, romaji to hiragana", () =>
  {
    const results = toHiragana("カタカナ tesUTo鬱12 tu du cha tya")
    expect(results).to.equal("かたかな てすと鬱12 つ づ ちゃ ちゃ")
  })
  it("doesn't do anything to hiragana+kanji", () => {
    const results = toHiragana("食べる")
    expect(results).to.equal("食べる")
  })
  it("converts ijou correctly", () => {
    const results = toHiragana("ijou")
    expect(results).to.equal("いじょう")
  })
  it("converts jii correctly", () => {
    const results = toHiragana("jii")
    expect(results).to.equal("じい")
  })
})