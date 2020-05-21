import { expect } from "chai"
import { toHiragana } from "../src/kana-tools"

describe("kana-tools", function ()
{
  it("katakana to hiragana, romaji to hiragana", () =>
  {
    expect(toHiragana("カタカナ tesUTo鬱12 tu du cha tya")).to.equal("かたかな てすと鬱12 つ づ ちゃ ちゃ")
    expect(toHiragana("食べる")).to.equal("食べる")
    expect(toHiragana("ijou")).to.equal("いじょう")
    expect(toHiragana("jii")).to.equal("じい")
    expect(toHiragana("midara")).to.equal("みだら")
    expect(toHiragana("izatonattara")).to.equal("いざとなったら")
    expect(toHiragana("nancharanantyara")).to.equal("なんちゃらなんちゃら")
    expect(toHiragana("onnna")).to.equal("おんな")
    expect(toHiragana("honnyaku")).to.equal("ほんやく")
    expect(toHiragana("kannnaduki")).to.equal("かんなづき")
    expect(toHiragana("yuuto")).to.equal("ゆうと")
    expect(toHiragana("tubo")).to.equal("つぼ")
    expect(toHiragana("tsubo")).to.equal("つぼ")
    expect(toHiragana("lolita")).to.equal("ろりた")
  })
  describe("katakanaToHiragana()", () => {
    it("should convert all katakana in a sentence to hiragana", () => {
      expect(toHiragana("漢字　カタカナ　ひらがな")).to.equal("漢字　かたかな　ひらがな")
      let allKatakana = "ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶ"
      let allHiragana = "ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをんゔゕゖ"
      expect(toHiragana(allKatakana + allHiragana)).to.equal(allHiragana + allHiragana)
    })
  })
})