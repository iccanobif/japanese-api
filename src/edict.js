const fs = require("fs")
const readline = require("readline")
const ut = require("./utils.js")

const partOfSpeechWhitelist = new Set("v1|v5aru|v5b|v5g|v5k-s|v5k|v5m|v5n|v5r-i|v5r|v5s|v5t|v5u-s|v5uru|v5u|v5|adj-ix|adj-i|vs-s|vs-i".split("|"))
const unsupportedConjugations = new Set(["v5", "v5aru", "v5r-i", "v5u-s", "v5uru"])

let dictionary = {}
let conjugatedToUnconjugatedFormsDictionary = {} // keys are strings, values are Set
let kanjiToReadingsDictionary = {}
let isLoaded = false
let callbacks = []

function makeCleanParsingStatus() 
{
  return {
    kanjiElements: [],
    readingElements: [],
    kanjiReadingLinks: [], // each "link" is an array [kanji, reading]
    keys: new Set(),
    partOfSpeech: new Set(),
    glosses: [],
    re_restr: []
  }
}

let currentParsingStatus = makeCleanParsingStatus()

function conjugate(kanjiWord, kanaWord, partOfSpeech)
{
  if (partOfSpeech == null)
    return []
  if (unsupportedConjugations.has(partOfSpeech))
    return [] // I don't know how to conjugate this stuff (yet)

  let newWords = []

  function add(suffix, charactersToTrim)
  {
    // Add to the output the original word replacing the last charactersToTrim characters with the suffix provided
    if (typeof charactersToTrim === "undefined")
      charactersToTrim = 1

    newWords.push({
      kanjiElement: kanjiWord == null ? null : kanjiWord.slice(0, kanjiWord.length - charactersToTrim) + suffix,
      readingElement: kanaWord == null ? null : kanaWord.slice(0, kanaWord.length - charactersToTrim) + suffix
    })
  }

  if (partOfSpeech == "vs-s" || partOfSpeech == "vs-i")
  {
    "し、します、しました、しません、しない、すれば、しよう、して、している、してる、しなかった、される、させる、しろ、した、したい、せず、しぬ"
      .split("、")
      .forEach(suffix => add(suffix, 2))
    return newWords
  }

  switch (partOfSpeech)
  {
    case "adj-i":
      add("くない") // negative
      add("く")    // adverbial form
      add("かった") // past
      add("くなかった") // past negative
      add("くて") // te-form
      add("すぎる") // too much
      add("過ぎる") // too much
      add("すぎ") // too much
      add("そう") // looks like it's...
      add("さ") // nominalization
      break;
    case "adj-ix":
      add("よくない", 2) // negative
      add("よく", 2) // adverbial form
      add("よかった", 2) // past
      add("よくなかった", 2) // past negative
      add("よくて", 2) // te-form
      break;
    case "v1":
      add("") // stem
      add("ます") // masu-form
      add("ました") // masu-form
      add("ません") // masu-form
      add("ない") // negative
      add("た") // past
      add("なかった") // past negative
      add("て") // -te form
      add("ている") // -te+iru form
      add("てる") // -teiru form (informal)
      add("られる") // potential + passive (they're the same for ichidan verbs...)
      add("させる") // causative
      add("よう") // volitive
      add("たい") // tai-form
      add("ず") // zu-form
      add("ろ") // imperative
      add("ぬ") // archaic negative
      add("ちゃう"); add("ちゃった"); add("ちゃって"); // contraction of て+しまう
      break;
    case "v5s":
      add("した") // past
      add("して") // -te form
      add("している") // -te+iru form
      add("してる") // -te+iru form (informal)
      break;
    case "v5k":
      add("いた") // past
      add("いて") // -te form
      add("いている") // -te+iru form
      add("いてる") // -te+iru form (informal)
      break;
    case "v5g":
      add("いだ") // past
      add("いで") // -te form
      add("いでいる") // -te+iru form
      add("いでる") // -te+iru form (informal)
      break;
    case "v5k-s": // for verbs ending in 行く
      add("った") // past
      add("いて") // -te form
      add("いている") // -te+iru form
      add("いてる") // -te+iru form (informal)
      break;
    case "v5b":
    case "v5m":
    case "v5n":
      add("んだ") // past
      add("んで") // -te form
      add("んている") // -te+iru form
      add("んてる") // -te+iru form (informal)
      break;
    case "v5r":
    case "v5t":
    case "v5u":
      add("った") // past
      add("って") // -te form
      add("っている") // -te+iru form
      add("ってる") // -te+iru form (informal)
  }

  let firstNegativeKana = ""
  let stemKana = ""

  switch (partOfSpeech)
  {
    case "v5k-s": // potential // volitive // imperative  
    case "v5k": add("ける"); add("こう"); add("け"); stemKana = "き"; firstNegativeKana = "か"; break;
    case "v5g": add("げる"); add("ごう"); add("げ"); stemKana = "ぎ"; firstNegativeKana = "が"; break;
    case "v5b": add("べる"); add("ぼう"); add("べ"); stemKana = "び"; firstNegativeKana = "ば"; break;
    case "v5m": add("める"); add("もう"); add("め"); stemKana = "み"; firstNegativeKana = "ま"; break;
    case "v5n": add("ねる"); add("のう"); add("ね"); stemKana = "に"; firstNegativeKana = "な"; break;
    case "v5r": add("れる"); add("ろう"); add("れ"); stemKana = "り"; firstNegativeKana = "ら"; break;
    case "v5t": add("てる"); add("とう"); add("て"); stemKana = "ち"; firstNegativeKana = "た"; break;
    case "v5u": add("える"); add("おう"); add("え"); stemKana = "い"; firstNegativeKana = "わ"; break;
    case "v5s": add("せる"); add("そう"); add("せ"); stemKana = "し"; firstNegativeKana = "さ"; break;
  }

  if (partOfSpeech.startsWith("v5"))
  {
    add(firstNegativeKana + "ない")  // negative
    add(firstNegativeKana + "なかった")  // past negative
    add(firstNegativeKana + "せる")  // causative
    add(firstNegativeKana + "れる")  // passive
    add(firstNegativeKana + "ず")  // zu-form
    add(firstNegativeKana + "ぬ")  // archaic negative
    add(firstNegativeKana)  // 未然形

    add(stemKana) // stem
    add(stemKana + "たい") // tai-form
    add(stemKana + "ます") // masu-form
    add(stemKana + "ました") // masu-form (past)
    add(stemKana + "ません") // masu-form (negative)
    add(stemKana + "ちゃう"); add(stemKana + "ちゃった"); add(stemKana + "ちゃって")
  }

  return newWords
}

ut.log("Start loading edict")

const dirtyOpeningTag = new RegExp("<(pos|misc|ke_inf|dial|re_inf|field)>&", "g")
const dirtyClosingTag = new RegExp(";</(pos|misc|ke_inf|dial|re_inf|field)>", "g")

readline
  .createInterface({ input: fs.createReadStream("datasets/JMdict_e") })
  .on("line", (line) =>
  {
    if (line.startsWith("<keb>"))
    {
      let keb = line.substring("<keb>".length, line.length - "</keb>".length)
      currentParsingStatus.kanjiElements.push(keb)
      currentParsingStatus.keys.add(keb)
    }
    if (line.startsWith("<reb>"))
    {
      let reb = line.substring("<reb>".length, line.length - "</reb>".length)
      currentParsingStatus.readingElements.push(reb)
      currentParsingStatus.keys.add(reb)
    }
    if (line.startsWith("<re_restr>"))
    {
      // This element is used to indicate when the reading only applies
      // to a subset of the keb elements in the entry. In its absence, all
      // readings apply to all kanji elements. The contents of this element 
      // must exactly match those of one of the keb elements.
      currentParsingStatus.re_restr.push(line.substring("<re_restr>".length, line.length - "</re_restr>".length))
    }
    if (line.startsWith("</r_ele>"))
    {
      // I assume that all kanjiElements for this entry have been loaded (all <k_ele> tags come before the <r_ele> ones)

      (currentParsingStatus.re_restr.length == 0
        ? currentParsingStatus.kanjiElements
        : currentParsingStatus.re_restr)
        .forEach((kanjiElement) =>
        {
          currentParsingStatus.kanjiReadingLinks.push({
            kanjiElement: kanjiElement,
            readingElement: currentParsingStatus.readingElements[currentParsingStatus.readingElements.length - 1]
          })
        })

      currentParsingStatus.re_restr = []
    }
    if (line.startsWith("<pos>"))
    {
      // For some reason <pos> entries begin with a & and end with a ;
      // I don't include them in the strings I add to the partOfSpeech array
      let type = line.substring("<pos>".length + 1, line.length - "</pos>".length - 1)

      if (partOfSpeechWhitelist.has(type))
        currentParsingStatus.partOfSpeech.add(type)
    }
    if (line.startsWith("<gloss>"))
    {
      currentParsingStatus.glosses.push(line.substring("<gloss>".length, line.length - "</gloss>".length))
    }
    if (line.startsWith("</entry>"))
    {
      // I have collected all relevant data for this entry, can add it to the dictionary

      // Add unconjugated forms to the kanjiToReadingsDictionary
      currentParsingStatus
        .kanjiReadingLinks
        .forEach(link =>
        {
          ut.addToDictionaryOfSets(kanjiToReadingsDictionary,
            link.kanjiElement,
            ut.katakanaToHiragana(link.readingElement))
        })

      // Conjugate all words I can conjugate, and at the same time populate the data
      // structures needed for converting kanji to kana etc..
      // Alas, some verbs (very few) can behave both as v1 and as v5r, so I have to loop through the the possible PoS's...
      Array
        .from(currentParsingStatus.partOfSpeech) // convert to array
        .filter((partOfSpeech) => partOfSpeechWhitelist.has(partOfSpeech)) // only consider the relevant types of part of speech for conjugations
        .forEach(partOfSpeech =>
        {
          currentParsingStatus
            .kanjiReadingLinks
            .forEach(link =>
            {
              let conjugations = conjugate(link.kanjiElement, link.readingElement, partOfSpeech)
              conjugations.forEach(conjugatedLink =>
              {
                ut.addToDictionaryOfSets(kanjiToReadingsDictionary,
                  conjugatedLink.kanjiElement,
                  ut.katakanaToHiragana(conjugatedLink.readingElement))
                ut.addToDictionaryOfSets(conjugatedToUnconjugatedFormsDictionary,
                  conjugatedLink.kanjiElement,
                  link.kanjiElement)
                ut.addToDictionaryOfSets(conjugatedToUnconjugatedFormsDictionary,
                  conjugatedLink.readingElement,
                  link.readingElement)
                currentParsingStatus.kanjiReadingLinks.push(conjugatedLink)
                currentParsingStatus.keys.add(conjugatedLink.kanjiElement)
                currentParsingStatus.keys.add(conjugatedLink.readingElement)
              })
            })
        });

      // Now that I have enriched the kanjiReadingLinks with all the conjugated forms, it's time to add
      // this entry to the dictionary

      let entryData = {
        kanjiElements: currentParsingStatus.kanjiElements,
        readingElements: currentParsingStatus.readingElements,
        partOfSpeech: currentParsingStatus.partOfSpeech,
        glosses: currentParsingStatus.glosses
      }

      Array.from(currentParsingStatus.keys)
        .forEach((key) => // For each "key" adds the entry in the dictionary
        {
          ut.addToDictionaryOfLists(dictionary, key, entryData)
        })

      currentParsingStatus = makeCleanParsingStatus()
    }
  })
  .on("close", () =>
  {
    ut.log("Finished loading edict")
    isLoaded = true
    callbacks.forEach(callback => callback())
    callbacks = null
  })

module.exports.isLoaded = () =>
{
  return isLoaded
}

module.exports.isJapaneseWord = (word) =>
{
  return word in dictionary
}

module.exports.getDefinitions = (word) =>
{
  if (word in dictionary)
    return dictionary[word]
  else
    return []
}

let exceptions = {
  "私": ["わたし"],
  "彼": ["かれ"],
  "彼の": ["かれの"],
  "物": ["もの"],
  "母": ["はは"],
  "僕": ["ぼく"],
  "０": ["０"],
  "１": ["１"],
  "２": ["２"],
  "３": ["３"],
  "４": ["４"],
  "５": ["５"],
  "６": ["６"],
  "７": ["７"],
  "８": ["８"],
  "９": ["９"],
  "・": ["・"]
}

module.exports.getReadings = (word, doFiltering) =>
{
  if (doFiltering)
  {
    // For a few very common words that happen to also have a lot of uncommon readings (私 probably being 
    // the worst offender) or that have many common readings but that are unlikely to be the right ones
    // when looking for that word by itself (物 for example wouldn't normally be ぶつ, when alone) ignore
    // the dictionary and just return some hardcoded readings.    
    if (word in exceptions) return exceptions[word]
  }

  if (word in kanjiToReadingsDictionary)
    return Array.from(kanjiToReadingsDictionary[word])
  else
    return [word]
}

module.exports.getBaseForms = (conjugatedWord) =>
{
  if (conjugatedWord in conjugatedToUnconjugatedFormsDictionary)
    return Array.from(conjugatedToUnconjugatedFormsDictionary[conjugatedWord])
  else
    return [conjugatedWord] // It's not really conjugated, after all
}

module.exports.addLoadedCallback = (callback) =>
{
  if (isLoaded)
    callback()
  else
    callbacks.push(callback)
}
