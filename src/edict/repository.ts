import { DictionaryEntryInDb, DictionaryApiOutput } from "../types";
import { Collection } from "mongodb";

export async function getDictionaryEntries(dictionary: Collection<DictionaryEntryInDb>, query: string)
  : Promise<DictionaryApiOutput[]>
{
  const results = await dictionary.find({ allKeys: query }).toArray()

  const output = results.map(r =>
    ({
      lemmas: r.lemmas.filter(l => !l.isConjugated).map(l => l.kanji + "（" + l.reading + "）"),
      glosses: r.daijirinArticles.map(d => d.glosses).flat().concat(r.edictGlosses)
    })
  )

  return output
}
