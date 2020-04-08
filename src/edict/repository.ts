import { DictionaryEntryInDb, DictionaryApiOutput } from "../types";
import { doOnMongoCollection } from "../utils";

export async function getDictionaryEntries(query: string)
  : Promise<DictionaryApiOutput[]>
{

  return await doOnMongoCollection<DictionaryEntryInDb>("dictionary",
    coll => coll
      .aggregate([
        { $match: { allKeys: query } },
        {
          $project: {
            _id: 0,
            kanjiLemmas: {
              $map: {
                input: { $filter: { input: "$lemmas", cond: { $not: "$$this.isConjugated" } } },
                in: "$$this.kanji"
              }
            },
            readingLemmas: {
              $map: {
                input: { $filter: { input: "$lemmas", cond: { $not: "$$this.isConjugated" } } },
                in: "$$this.reading"
              }
            },
            glosses: { $concatArrays: ["$daijirinGlosses", "$edictGlosses"] },
          }
        }
      ])
      .toArray()
  )
}
