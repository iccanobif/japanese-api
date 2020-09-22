// accentedMora: 0 if word is flat (平板)
//               N when the Nth mora is the last high-pitched one

export function applyAccentToString(inputText: string, accentedMora: number): string
{
  if (accentedMora === 0)
    return inputText

  let adjustedNumber = 0
  for (let i = 0; i < accentedMora; i++)
  {
    adjustedNumber++
    if (adjustedNumber < inputText.length
      && ["ョ", "ャ", "ュ"].includes(inputText.charAt(adjustedNumber)))
      adjustedNumber++
  }

  return inputText.substring(0, adjustedNumber) + "↓" + inputText.substring(adjustedNumber)
}