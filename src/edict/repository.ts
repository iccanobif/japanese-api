import { DictionaryEntryInDb, ApiWordOutput, ApiSentenceOutput } from "../types";
import { Collection } from "mongodb";
import { toHiragana } from "../kana-tools";
import { splitSentence } from "../split-sentence";

export async function getDictionaryEntries(dictionary: Collection<DictionaryEntryInDb>, query: string)
  : Promise<ApiWordOutput[]>
{
  const results = await dictionary.find({ allKeys: toHiragana(query) }).toArray()

  const output = results.map(r =>
    ({
      lemmas: r.lemmas.filter(l => !l.isConjugated).map(l => l.kanji + "（" + l.reading + "）"),
      glosses: r.daijirinArticles.map(d => d.glosses).flat().concat(r.edictGlosses)
    })
  )

  return output
}

export async function getEntriesForSentence(dictionary: Collection<DictionaryEntryInDb>, sentence: string)
  : Promise<ApiSentenceOutput[]>
{
  const splits = await splitSentence(dictionary, sentence)

  const output: ApiSentenceOutput[] = []

  for (const word of splits)
    output.push({ word: word, dictionaryEntries: await getDictionaryEntries(dictionary, word) })

  return output
}

