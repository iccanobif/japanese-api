// import {
//   addToDictionaryOfLists,
//   katakanaToHiragana,
//   addToDictionaryOfSets
// } from "../src/utils"

// import {
//   isJapaneseWord,
//   addLoadedCallback,
//   getBaseForms,
//   getDefinitions,
//   getReadings
// } from "../src/edict/edict"

// const assert = require("assert")

// describe('edict', function () {
//   this.timeout(20000)
//   before((done) => {
//     addLoadedCallback(done)
//   })
//   describe('isJapaneseWord()', () => {
//     it('should recognize base forms ', () => { assert.ok(isJapaneseWord("食べる")) })
//     it('should recognize past forms ', () => { assert.ok(isJapaneseWord("食べた")) })
//     it('should not recognize non-existing words ', () => { assert.ok(!isJapaneseWord("fdsarv")) })
//     it('そう for for i-adj ', () => { assert.ok(isJapaneseWord("強そう")) })
//     it('すぎる for for i-adj ', () => { assert.ok(isJapaneseWord("強すぎる")) })
//     describe("imperative forms", () => {
//       it('v1', () => { assert.ok(isJapaneseWord("食べろ")) })
//       it('v5s', () => { assert.ok(isJapaneseWord("隠せ")) })
//       it('v5k', () => { assert.ok(isJapaneseWord("置け")) })
//       it('v5g', () => { assert.ok(isJapaneseWord("泳げ")) })
//       it('v5k-s', () => { assert.ok(isJapaneseWord("持っていけ")) })
//       it('v5b', () => { assert.ok(isJapaneseWord("学べ")) })
//       it('v5m', () => { assert.ok(isJapaneseWord("飲め")) })
//       it('v5n', () => { assert.ok(isJapaneseWord("死ね")) })
//       it('v5r', () => { assert.ok(isJapaneseWord("謝れ")) })
//       it('v5t', () => { assert.ok(isJapaneseWord("待て")) })
//       // Do imperatives exist for v5u??
//     })
//     it("should conjugate 湿気る both as a v1 and as a v5r", () => {
//       assert.ok(isJapaneseWord("湿気た"))
//       assert.ok(isJapaneseWord("湿気った"))
//     })
//     it("should conjugate ぬ (negative) verb forms too", () => {
//       assert.ok(isJapaneseWord("知らぬ"))
//       assert.ok(isJapaneseWord("出来ぬ"))
//       assert.ok(isJapaneseWord("食べぬ"))
//     })
//     it("Conjugate verbs to their 未然形 form too, so that something like 言わなければならない at least gets the 言わ part clickable and pointing to 言う", () => {
//       assert.ok(isJapaneseWord("言わ"))
//     })
//     it("should conjugate vs-s verbs", () => {
//       assert.ok(isJapaneseWord("面した"))
//       assert.ok(isJapaneseWord("しなかった"))
//     })
//   })
//   describe("getDefinition()", () => {
//     it("should get the definitions of unconjugated words", () => {
//       let definitions = getDefinitions("食べる")
//       assert.equal(definitions.length, 1)
//     })
//     it("should get the definitions of conjugated words", () => {
//       let definitions = getDefinitions("泳いだ")
//       assert.equal(definitions.length, 1)
//       assert.ok(definitions[0].kanjiElements.includes("泳ぐ"))
//     })
//     it("should get more than one definition for ambiguous pronounciations", () => {
//       let definitions = getDefinitions("かんじょう")
//       assert.ok(definitions.length > 1)
//       assert.ok(definitions.filter((x: any) => x.kanjiElements.includes("感情")).length = 1)
//       assert.ok(definitions.filter((x: any) => x.kanjiElements.includes("勘定")).length = 1)
//     })
//     it("should return an empty array when asked for a word that's not in the dictionary", () => {
//       assert.deepStrictEqual([], getDefinitions("this is not a word"))
//     })
//     it("should return a definition object with a kanjiElements property ", () => {
//       let definitions = getDefinitions("食べる")
//       assert.ok(definitions[0].kanjiElements.includes("食べる"))
//     })
//     it("should return a definition object with a readingElements property ", () => {
//       let definitions = getDefinitions("食べる")
//       assert.ok(definitions[0].readingElements.includes("たべる"))
//     })
//     it("should return a definition object with a glosses property ", () => {
//       let definitions = getDefinitions("食べる")
//       assert.ok(definitions[0].glosses.includes("to eat"))
//     })
//     it("should provide readings in the correct order (the more common first, the least common last)", () => {
//       let definitions = getDefinitions("輸出")
//       assert.deepStrictEqual(definitions[0].readingElements, ["ゆしゅつ", "しゅしゅつ"])
//     })
//   })
//   describe("getBaseForms", () => {
//     it("should get the base form of a conjugated verb (kanji)", () => {
//       assert.deepStrictEqual(getBaseForms("食べられる"), ["食べる"])
//       assert.deepStrictEqual(getBaseForms("食べた"), ["食べる"])
//     })
//     it("should get the base form of a conjugated verb (kana)", () => {
//       assert.deepStrictEqual(getBaseForms("たべられる"), ["たべる"])
//     })
//     it("should get all possible base forms in case of ambiguity", () => {
//       let baseForms = getBaseForms("いった")
//       assert.equal(3, baseForms.length)
//       assert.ok(baseForms.includes("いく"))
//       assert.ok(baseForms.includes("いう"))
//       assert.ok(baseForms.includes("いる"))
//     })
//   })
//   describe("getReadings()", () => {
//     function checkKanjiWithOnlyOnePossibleReading(word, reading) {
//       let readings = getReadings(word, true)
//       assert.equal(readings.length, 1)
//       assert.equal(readings[0], reading)
//     }
//     it("should convert uninflected kanji words to kana correctly", () => {
//       checkKanjiWithOnlyOnePossibleReading("食べる", "たべる")
//     })
//     it("should convert inflected kanji words to kana correctly", () => {
//       checkKanjiWithOnlyOnePossibleReading("食べた", "たべた")
//     })
//     it("should use re_restr to map each reading to the correct kanji form", () => {
//       checkKanjiWithOnlyOnePossibleReading("この上なく", "このうえなく")
//     })
//     it("should just return わたし for 私, when asking for filtered readings", () => {
//       checkKanjiWithOnlyOnePossibleReading("私", "わたし")
//       assert.ok(getReadings("私", false).length > 1)
//     })
//     it("should return only hiragana readings, even if edict also lists a katakana one", () => {
//       checkKanjiWithOnlyOnePossibleReading("犬", "いぬ")
//     })
//     it("should return numbers when fed numbers", () => {
//       for (let i = 0; i < 10; i++) {
//         // 65297 == "１".codePointAt(0)
//         const num: string = String.fromCodePoint(65297 + i)
//         checkKanjiWithOnlyOnePossibleReading(num, num)
//       }
//     })
//   })
// })

