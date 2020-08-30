import { expect } from "chai"
import { extractPitchAccentPositionFromLemma } from "../src/daijirin/daijirin-parse-utilities"

describe("daijirin-parse", function ()
{
  it("can extract pitch accent data from the lemma definition", () =>
  {
    expect(extractPitchAccentPositionFromLemma("しつむりつ [3] 【悉無律】")).to.deep.equal([3])
    expect(extractPitchAccentPositionFromLemma("しつらい シツラヒ [0][3] 【設い】")).to.deep.equal([0, 3])
    expect(extractPitchAccentPositionFromLemma("しつぼう【失望】")).to.deep.equal(null)
  })
})