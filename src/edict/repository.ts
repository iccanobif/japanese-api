import { DictionaryEntry } from "../types";
import { doOnMongoCollection } from "../utils";

export async function getDictionaryEntries(query: string): Promise<DictionaryEntry[]> {

  return await doOnMongoCollection<DictionaryEntry, any[]>("dictionary",
    coll => coll
      .find({ keys: query },
        { projection: { glosses: 1, _id: 0 } })
      .toArray()
  )
}
