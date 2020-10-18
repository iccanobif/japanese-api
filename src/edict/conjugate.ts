import { Lemma } from "../types"

const unsupportedConjugations = new Set(["v5", "v5r-i", "v5u-s", "v5uru"])

// Returns only the conjugated stuff, not the originals
export function conjugate(kanjiWord: string, 
                          kanaWord: string, 
                          partOfSpeech: string): Lemma[] {
  if (partOfSpeech == null)
    return []
  if (unsupportedConjugations.has(partOfSpeech))
    return [] // I don't know how to conjugate this stuff (yet)

  let newWords: Lemma[] = []

  function add(suffix: string, charactersToTrim: number = 1) {
    // Add to the output the original word replacing the last charactersToTrim characters with the suffix provided
    newWords.push({
      kanji: kanjiWord.slice(0, kanjiWord.length - charactersToTrim) + suffix,
      reading: kanaWord.slice(0, kanaWord.length - charactersToTrim) + suffix,
      isConjugated: true
    })
  }

  if (partOfSpeech == "vs-s" || partOfSpeech == "vs-i") {
    "し、します、しました、しません、しない、すれば、しよう、して、している、してる、しなかった、される、させる、しろ、した、したい、せず、しぬ"
      .split("、")
      .forEach(suffix => add(suffix, 2))
    return newWords
  }

  switch (partOfSpeech) {
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
      add("き") // obsolete 連体形
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
    case "v5aru":
      add("った") // past
      add("って") // -te form
      add("っている") // -te+iru form
      add("ってる") // -te+iru form (informal)
  }

  let firstNegativeKana = ""
  let stemKana = ""

  switch (partOfSpeech) {
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
    case "v5aru": add("れる"); add("ろう"); add("れ"); stemKana = "い"; firstNegativeKana = "ら"; break; // v5aru seems to be like v5r but い as 連用形 (ex. いらっしゃる)
  }

  if (partOfSpeech.startsWith("v5")) {
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