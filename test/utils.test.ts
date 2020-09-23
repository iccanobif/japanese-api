import {
  addToDictionaryOfLists,
  addToDictionaryOfSets,
  uniq
} from "../src/utils"

const assert = require("assert")
describe("utils", function () {
  describe("uniq()", () =>
  {
    it("should work with numbers", () =>
    {
      assert.deepStrictEqual([1, 2, 3], uniq([2, 2, 1, 3]))
    })
    it("should work with strings", () =>
    {
      assert.deepStrictEqual(['オ↓ッサン [1]' , 'オッサン [0]'], uniq([ 'オッサン [0]', 'オッサン [0]', 'オ↓ッサン [1]' ]))
    })
  })
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
})
