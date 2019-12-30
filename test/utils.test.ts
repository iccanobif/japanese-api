import {
  addToDictionaryOfLists,
  katakanaToHiragana,
  addToDictionaryOfSets
} from "../src/utils"

const assert = require("assert")
describe("utils", function () {
  // describe("uniq()", () =>
  // {
  //   it("should work lol", () =>
  //   {
  //     assert.deepStrictEqual([1, 2, 3], [2, 2, 1, 3].uniq())
  //   })
  // })
  describe("addToDictionaryOfLists()", () => {
    it("should add values for new keys", () => {
      const dictionary: { [id: string]: string[] } = {}
      addToDictionaryOfLists(dictionary, "key", "value")
      assert.deepStrictEqual(dictionary["key"], ["value"])
    })
    it("should add values for existing keys", () => {
      const dictionary: { [id: string]: string[] } = {}
      addToDictionaryOfLists(dictionary, "key", "value1")
      addToDictionaryOfLists(dictionary, "key", "value2")
      assert.deepStrictEqual(dictionary["key"], ["value1", "value2"])
    })
  })
  describe("addToDictionaryOfSets()", () => {
    it("should add values for new keys", () => {
      let set = new Set()
      assert.ok(!("key" in set))
      addToDictionaryOfSets(set, "key", "value")
      assert.ok(("key" in set))
    })
    it("should add values for existing keys", () => {
      // let set = new Set()
      const dictionary: { [id: string]: Set<string> } = {}
      addToDictionaryOfSets(dictionary, "key", "value1")
      addToDictionaryOfSets(dictionary, "key", "value2")
      assert.deepStrictEqual(Array.from(dictionary["key"]).sort(), ["value1", "value2"])
    })
    it("should keep only one copy of a value added more than once", () => {
      const dictionary: { [id: string]: Set<string> } = {}
      addToDictionaryOfSets(dictionary, "key", "value1")
      addToDictionaryOfSets(dictionary, "key", "value1")
      assert.deepStrictEqual(Array.from(dictionary["key"]), ["value1"])
    })
  })
  describe("katakanaToHiragana()", () => {
    it("should convert all katakana in a sentence to hiragana", () => {
      assert.equal(katakanaToHiragana("English 漢字　カタカナ　ひらがな"), "English 漢字　かたかな　ひらがな")
      let allKatakana = "ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶ"
      let allHiragana = "ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをんゔゕゖ"
      assert.equal(katakanaToHiragana(allKatakana + allHiragana), allHiragana + allHiragana)
    })
  })
})
