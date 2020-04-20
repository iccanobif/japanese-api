import { DictionaryEntryInDb, DictionaryApiOutput } from "../types";
import { doOnMongoCollection } from "../utils";

export async function getDictionaryEntries(query: string)
  : Promise<DictionaryApiOutput[]>
{
  const results = await doOnMongoCollection<DictionaryEntryInDb>("dictionary",
    coll => coll.find({ allKeys: query }).toArray()
  ) as DictionaryEntryInDb[]

  return results.map(r =>
    ({
      lemmas: r.lemmas.filter(l => !l.isConjugated).map(l => l.kanji + "（" + l.reading + "）"),
      glosses: r.daijirinArticles.map(d => d.glosses).flat().concat(r.edictGlosses)
    })
  )
}
