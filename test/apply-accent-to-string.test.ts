import { expect } from "chai"
import { applyAccentToString } from "../src/apply-accent-to-string"

describe("applyAccentToString", function ()
{
  it("can put the ↓ symbol after the accented mora ", () =>
  {
    expect(applyAccentToString("しつむりつ [3] 【悉無律】", 3)).to.deep.equal("しつむ↓りつ")
    expect(applyAccentToString("あべこべ [0] （名・形動）", 0)).to.deep.equal("あべこべ")
    expect(applyAccentToString("いらっしゃい [4]", 4)).to.deep.equal("いらっしゃ↓い")
    expect(applyAccentToString("いろ【色】", 2)).to.deep.equal("いろ↓")
    expect(applyAccentToString("いか・す [0] （動サ五）", 0)).to.deep.equal("いかす")
  })
})