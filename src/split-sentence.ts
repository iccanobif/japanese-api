import { DictionaryEntryInDb } from "./types";
import { Collection } from "mongodb";
import { toHiragana } from "./kana-tools";

export async function wordExists(dictionary: Collection<DictionaryEntryInDb>, word: string)
{
  const result = await dictionary.findOne({ allKeys: word })
  return !(result === null)
}

export async function splitSentence(dictionary: Collection<DictionaryEntryInDb>, sentence: string): Promise<string[]>
{
  if (sentence == "")
    return []
  if (sentence.length == 1)
    return [sentence]

  const splitsByWhitespaceAndPunctuation = sentence.split(/[\s\.\,\。\、]/)
  if (splitsByWhitespaceAndPunctuation.length > 1)
  {
    const wordSplitsPromises = splitsByWhitespaceAndPunctuation
      .map(s => splitSentence(dictionary, s))
    const wordSplits = await Promise.all(wordSplitsPromises)
    return wordSplits.flat().filter(s => s != "")
  }

  const allFirstWordPossibilities = []
  const facets: { [key: number]: any } = {}

  for (let i = 1; i <= sentence.length; i++)
  {
    const word = toHiragana(sentence.substr(0, i))
    allFirstWordPossibilities.push(word)
    facets[i] = [{ $match: { allKeys: word } }, { $limit: 1 }, { $project: { lemmas: 1 } }]
  }

  const cursor = dictionary.aggregate([
    // $match stage to force index scan on relevant documents
    { $match: { allKeys: { $in: allFirstWordPossibilities } } },
    { $facet: facets },
  ])

  const results = (await cursor.toArray())[0] as any

  // Find longest result
  let firstWord = ""
  for (let i = sentence.length; i >= 1; i--)
    if (results[i].length > 0)
    {
      firstWord = sentence.substr(0, i)
      break
    }

  if (firstWord == "")
    firstWord = sentence.charAt(0)

  const restOfSentenceSplits = await splitSentence(dictionary, sentence.substring(firstWord.length, sentence.length))

  return [firstWord].concat(restOfSentenceSplits)
}
