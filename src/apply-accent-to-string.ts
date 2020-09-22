// accentedMora: 0 if word is flat (平板)
//               N when the Nth mora is the last high-pitched one

import { toHiragana } from "./kana-tools"

export function applyAccentToString(inputText: string, accentedMora: number): string
{
  // clean input:
  inputText = toHiragana(inputText).replace("・", "")

  // Exclude everything from the first non-hiragana character
  inputText = inputText.substring(0, inputText.search(/[^ぁ-んー]/))

  if (accentedMora === 0)
    return inputText

  let adjustedNumber = 0
  for (let i = 0; i < accentedMora; i++)
  {
    adjustedNumber++
    if (adjustedNumber < inputText.length
      && ["ょ", "ゃ", "ゅ"].includes(inputText.charAt(adjustedNumber)))
      adjustedNumber++
  }

  return inputText.substring(0, adjustedNumber) + "↓" + inputText.substring(adjustedNumber)
}