import { DictionaryEntry } from "../types";
import { doOnMongoCollection } from "../utils";


export async function getDictionaryEntries(query: string): Promise<DictionaryEntry[]> {

  return await doOnMongoCollection<DictionaryEntry, DictionaryEntry[]>("dictionary",
    async (coll) => {
      return await coll.find({ keys: query }).toArray()
    })
}
