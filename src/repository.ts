import { DictionaryEntryInDb, ApiWordOutput, ApiSentenceOutput } from "./types";
import { Collection } from "mongodb";
import { toHiragana } from "./kana-tools";
import { splitSentence, getSubstringsIncludingPosition } from "./split-sentence";

export async function getDictionaryEntries(dictionary: Collection<DictionaryEntryInDb>, query: string)
  : Promise<ApiWordOutput[]> {
  const results = await dictionary.find({ allKeys: toHiragana(query) }).toArray()

  return sortByRelevance(results, query)
    .map(r => new ApiWordOutput(r))
}

export async function getEntriesForSentence(dictionary: Collection<DictionaryEntryInDb>, sentence: string)
  : Promise<ApiSentenceOutput[]> {
  const splits = await splitSentence(dictionary, sentence)
  const hiraganaSplits = splits.map(s => toHiragana(s))

  const facets: { [key: string]: any } = {}
  for (let i = 0; i < splits.length; i++)
    facets[i] = [{ $match: { allKeys: hiraganaSplits[i] } }]

  const cursor = dictionary.aggregate([
    { $match: { allKeys: { $in: hiraganaSplits } } },
    { $facet: facets }
  ])

  const results = (await cursor.toArray())[0] as any

  const output: ApiSentenceOutput[] = []

  for (let i = 0; i < splits.length; i++)
    output.push({ word: splits[i], dictionaryEntries: sortByRelevance(results[i], splits[i]).map((r: any) => new ApiWordOutput(r)) })

  return output
}

export async function getEntriesForWordInOffset(dictionary: Collection<DictionaryEntryInDb>, sentence: string, offset: number)
  : Promise<ApiSentenceOutput[]> {
  const splits = getSubstringsIncludingPosition(sentence, offset)
  if (splits.length == 0)
    return []

  const facets: { [key: number]: any } = {}
  // for (const word of splits)
  for (let i = 0; i < splits.length; i++)
    facets[i] = [{ $match: { allKeys: toHiragana(splits[i]) } }]

  const cursor = dictionary.aggregate([
    { $match: { allKeys: { $in: splits.map(s => toHiragana(s)) } } },
    {
      $facet: facets
    }
  ])

  const results = (await cursor.toArray())[0] as any
  const output: ApiSentenceOutput[] = []

  // Ensure that the results are returned in the same order as the words
  // returned by getSubstringsIncludingPosition()
  for (const wordIndex in Object.keys(results).sort()) {
    if (results[wordIndex].length > 0)
      output.push({
        word: splits[wordIndex],
        dictionaryEntries: sortByRelevance(results[wordIndex] as DictionaryEntryInDb[], splits[wordIndex])
          .map(r => new ApiWordOutput(r))
      })
  }

  return output
}

function sortByRelevance(entries: DictionaryEntryInDb[], word: string) {
  word = toHiragana(word)
  return entries.sort((a, b) => {
    // Put entries that match with "word" in their unconjugated form on top.

    const isUnconjugatedA = !!a.lemmas.find(l => !l.isConjugated && (l.kanji == word || l.reading == word))
    const isUnconjugatedB = !!b.lemmas.find(l => !l.isConjugated && (l.kanji == word || l.reading == word))

    if (isUnconjugatedA && !isUnconjugatedB)
      return -1
    if (!isUnconjugatedA && isUnconjugatedB)
      return 1

    return 0
  })
}