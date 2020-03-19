import { DictionaryEntryInDb } from "../types";
import { doOnMongoCollection } from "../utils";

export async function getDictionaryEntries(query: string)
  : Promise<{ glosses: string[] }[]>
{

  return await doOnMongoCollection<DictionaryEntryInDb, any[]>("dictionary",
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
