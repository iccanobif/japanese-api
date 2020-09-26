import { DictionaryEntryInDb, ApiWordOutput, ApiSentenceOutput } from "./types";
import { Collection } from "mongodb";
import { toHiragana } from "./kana-tools";
import { splitSentence, getSubstringsIncludingPosition } from "./split-sentence";

export async function getDictionaryEntries(dictionary: Collection<DictionaryEntryInDb>, query: string)
  : Promise<ApiWordOutput[]>
{
  const results = await dictionary.find({ allKeys: toHiragana(query) }).toArray()

  return sortByRelevance(results, query)
    .map(r => new ApiWordOutput(r))
}

export async function getEntriesForSentence(dictionary: Collection<DictionaryEntryInDb>, sentence: string)
  : Promise<ApiSentenceOutput[]>
{
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
  : Promise<ApiWordOutput[]>
{
  const splits = getSubstringsIncludingPosition(sentence, offset)
  if (splits.length == 0)
    return []

  const facets: { [key: number]: any } = {}

  for (let i = 0; i < splits.length; i++)
    facets[i] = [{ $match: { allKeys: toHiragana(splits[i]) } }]

  const cursor = dictionary.aggregate([
    { $match: { allKeys: { $in: splits.map(s => toHiragana(s)) } } },
    {
      $facet: facets
    }
  ])

  const results = (await cursor.toArray())[0] as any // TODO: use correct type.
  const output: ApiWordOutput[] = []

  // This is to prevent duplicates: for example for a word like 落ち付いている matches 
  // both to the keys 落ち付いて and 落ち付いている, which point to the same document in the "dictionary" collection
  const idSet = new Set<string>()

  // Ensure that the results are returned in the same order as the words
  // returned by getSubstringsIncludingPosition()
  for (const wordIndex in Object.keys(results).sort())
  {
    if (results[wordIndex].length > 0)
    {
      sortByRelevance(results[wordIndex] as DictionaryEntryInDb[], splits[wordIndex])
        .map(r => new ApiWordOutput(r))
        .forEach(r =>
        {
          if (!idSet.has(r.id.toHexString()))
          {
            output.push(r)
            idSet.add(r.id.toHexString())
          }
        })
    }
  }

  return output
}

function sortByRelevance(entries: DictionaryEntryInDb[], word: string): DictionaryEntryInDb[]
{
  word = toHiragana(word)
  return entries.sort((a, b) =>
  {

    const priorityA = a.lemmas.findIndex(l => !l.isConjugated && (l.kanji == word || l.reading == word))
    const priorityB = b.lemmas.findIndex(l => !l.isConjugated && (l.kanji == word || l.reading == word))

    // Give priority to entries that match with "word" in their unconjugated form.
    if (priorityA >= 0 && priorityB == -1)
      return -1
    if (priorityA == -1 && priorityB >= 0)
      return 1

    // Also, give priority to the articles for which the word appears first in the lemma list.
    if (priorityA < priorityB)
      return -1
    if (priorityA > priorityB)
      return 1

    // If both cases are unconjugated, any order is fine (I don't know if I can trust the
    // order in which unconjugated lemmas were inserted in the lemmas list, anyway)

    return 0
  })
}