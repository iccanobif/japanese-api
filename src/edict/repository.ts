import { DictionaryEntryInDb, DictionaryApiOutput } from "../types";
import { doOnMongoCollection } from "../utils";

export async function getDictionaryEntries(query: string)
  : Promise<DictionaryApiOutput[]>
{

  return await doOnMongoCollection<DictionaryEntryInDb>("dictionary",
    coll => coll
      .aggregate([
        { $match: { lemmas: query } },
        {
          $project: {
            _id: 0,
            glosses: { $concatArrays: ["$daijirinGlosses", "$edictGlosses"] },
          }
        }
      ])
      .toArray()
  )
}
