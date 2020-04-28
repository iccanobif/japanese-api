// converts romaji to hiragana and katakana to hiragana
export function toHiragana(input: string): string
{
  let output = ""
  for (let i = 0; i < input.length; i++)
  {
    // Convert katakana to hiragana
    // hiragana from 12353 to 12435 (included)
    // katanaka from 12449 to 12531 (included)

    const charCode = input.charCodeAt(i)
    console.log(charCode)

    if (charCode >= 12449 && charCode <= 12531)
      output = output + String.fromCharCode(charCode - (12449 - 12353))
    else
      output = output + input.charAt(i)
  }
  return output
}


// _katakana = ""
// for i in range(12449, 12532):
//     _katakana += chr(i)
// _higarana = ""
// for i in range(12353, 12436):
//     _higarana += chr(i)
// _transkatatohira = str.maketrans(_katakana, _higarana)
// _transhiratokata = str.maketrans(_higarana, _katakana)

// def katakana_to_hiragana(str):
//     return str.translate(_transkatatohira)

// def hiragana_to_katakana(str):
//     return str.translate(_transhiratokata)