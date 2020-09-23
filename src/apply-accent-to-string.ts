// accentedMora: 0 if word is flat (平板)
//               N when the Nth mora is the last high-pitched one

import { toKatakana } from "./kana-tools"

export function applyAccentToString(inputText: string, accentedMora: number): string
{
  // clean input:
  inputText = toKatakana(inputText).replace("・", "")

  // Exclude everything from the first non-katakana character
  inputText = inputText.substring(0, inputText.search(/[^ァ-ンー]/))

  if (accentedMora === 0)
    return inputText + " [0]"

  let adjustedNumber = 0
  for (let i = 0; i < accentedMora; i++)
  {
    adjustedNumber++
    if (adjustedNumber < inputText.length
      && ["ャ", "ュ", "ョ"].includes(inputText.charAt(adjustedNumber)))
      adjustedNumber++
  }

  return inputText.substring(0, adjustedNumber) + "↓" + inputText.substring(adjustedNumber) + " [" + accentedMora + "]"
}