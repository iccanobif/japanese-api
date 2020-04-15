import { DictionaryEntryInDb, DictionaryApiOutput } from "../types";
import { doOnMongoCollection } from "../utils";

export async function getDictionaryEntries(query: string)
  : Promise<DictionaryApiOutput[]>
{
  const conjugatedResults = await doOnMongoCollection<DictionaryEntryInDb>("dictionary",
    coll => coll.find({ allConjugatedKeys: query }).toArray()
  ) as DictionaryEntryInDb[]

  const unconjugatedResults = await doOnMongoCollection<DictionaryEntryInDb>("dictionary",
    coll => coll.find({ allUnconjugatedKeys: query }).toArray()
  ) as DictionaryEntryInDb[]

  return unconjugatedResults.concat(conjugatedResults).map(r =>
    ({
      lemmas: r.lemmas.filter(l => !l.isConjugated).map(l => l.kanji + "（" + l.reading + "）"),
      glosses: r.daijirinGlosses.concat(r.edictGlosses)
    })
  )
}
