import { readFileSync } from "fs"

const kanaTable = JSON.parse(readFileSync("datasets/romaji-kana-table.json", { encoding: "utf8" })) as { romaji: string, kana: string }[]
const romajiToHiraganaMap: { [romaji: string]: string } = {}
kanaTable.forEach(k => romajiToHiraganaMap[k.romaji] = k.kana)

function romajiToHiragana(text: string): string
{
  text = text.toLowerCase()
  text = text.replace("nn", "ん")
  text = text.replace(/zz|yy|ww|tt|ss|rr|pp|nn|mm|kk|jj|hh|gg|ff|dd|cc|bb/g, s => "っ" + s.charAt(0))
  const kanaReplacementRegex = RegExp(kanaTable.map(r => r.romaji).join("|"), "g")
  return text.replace(kanaReplacementRegex, kana => romajiToHiraganaMap[kana])
}

function katakanaToHiragana(str: string)
{
  // In unicode, katakana is from 12449 to 12533, hiragana from 12353, 12435

  return str
    .split("")
    .map((c) =>
    {
      const codePoint = c.codePointAt(0)
      if (codePoint && codePoint >= 12449 && codePoint <= 12534)
        return String.fromCodePoint(codePoint - 96)
      else
        return c
    })
    .join("")
}

// converts romaji to hiragana and katakana to hiragana
export function toHiragana(input: string): string
{
  return katakanaToHiragana(romajiToHiragana(input))
}