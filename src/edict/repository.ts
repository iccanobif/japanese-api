import { DictionaryEntryInDb, ApiWordOutput, ApiSentenceOutput } from "../types";
import { Collection } from "mongodb";
import { toHiragana } from "../kana-tools";
import { splitSentence, getSubstringsIncludingPosition } from "../split-sentence";
import { log } from "../utils";

export async function getDictionaryEntries(dictionary: Collection<DictionaryEntryInDb>, query: string)
  : Promise<ApiWordOutput[]>
{
  const results = await dictionary.find({ allKeys: toHiragana(query) }).toArray()

  return results.map(r => new ApiWordOutput(r))
}

export async function getEntriesForSentence(dictionary: Collection<DictionaryEntryInDb>, sentence: string)
  : Promise<ApiSentenceOutput[]>
{
  const splits = await splitSentence(dictionary, sentence)

  const facets: { [key: string]: any } = {}
  for (let i = 0; i < splits.length; i++)
    facets[i] = [{ $match: { allKeys: toHiragana(splits[i]) } }]

  const cursor = dictionary.aggregate([
    { $match: { allKeys: { $in: splits } } },
    { $facet: facets }
  ])

  const results = (await cursor.toArray())[0] as any

  const output: ApiSentenceOutput[] = []

  for (let i = 0; i < splits.length; i++)
    output.push({ word: splits[i], dictionaryEntries: results[i].map((r: any) => new ApiWordOutput(r)) })

  return output
}

export async function getEntriesForWordInOffset(dictionary: Collection<DictionaryEntryInDb>, sentence: string, offset: number)
  : Promise<ApiSentenceOutput[]>
{
  const splits = getSubstringsIncludingPosition(sentence, offset)

  const facets: { [key: string]: any } = {}
  for (const word of splits)
    facets[word] = [{ $match: { allKeys: toHiragana(word) } }]

  const cursor = dictionary.aggregate([
    { $match: { allKeys: { $in: splits } } },
    {
      $facet: facets
    }
  ])

  const results = (await cursor.toArray())[0] as any
  const output: ApiSentenceOutput[] = []

  // for (let i = 0; i< splits.length; i++)
  //   output.push({ word: splits[i], dictionaryEntries: results[i].map((r: any) => new ApiWordOutput(r))})

  for (const word in results)
  {
    if (results[word].length > 0)
      output.push({
        word: word,
        dictionaryEntries: results[word].map((r: DictionaryEntryInDb) => new ApiWordOutput(r))
      })
  }

  // TODO sort by word length
  output.sort((a, b) => b.word.length - a.word.length)

  return output

}