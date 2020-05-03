import { readFileSync } from "fs"

const kanaTable = JSON.parse(readFileSync("datasets/romaji-kana-table.json", { encoding: "utf8" })) as { romaji: string, kana: string }[]
const romajiToHiraganaMap: { [romaji: string]: string } = {}
kanaTable.forEach(k => romajiToHiraganaMap[k.romaji] = k.kana)

function romajiToHiragana(text: string): string
{
  text = text.toLowerCase()
  text = text.replace("nn", "ん")
  text = text.replace(/zz|yy|ww|uu|tt|ss|rr|pp|nn|mm|kk|jj|hh|gg|ff|dd|cc|bb/g, s => "っ" + s.charAt(0))
  const kanaReplacementRegex = RegExp(kanaTable.map(r => r.romaji).join("|"), "g")
  return text.replace(kanaReplacementRegex, kana => romajiToHiraganaMap[kana])
}

function katakanaToHiragana(input: string): string
{
  let output = ""
  // hiragana from 12353 to 12435 (included)
  // katanaka from 12449 to 12531 (included)
  for (let i = 0; i < input.length; i++)
  {
    const charCode = input.charCodeAt(i)

    if (charCode >= 12449 && charCode <= 12531)
      output = output + String.fromCharCode(charCode - (12449 - 12353))
    else
      output = output + input.charAt(i)
  }
  return output
}

// converts romaji to hiragana and katakana to hiragana
export function toHiragana(input: string): string
{
  return katakanaToHiragana(romajiToHiragana(input))
}