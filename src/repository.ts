import { Db } from "mongodb";
import { DictionaryEntryInDb } from "./types";

export class Repository
{
  db: Db;

  constructor(appDb: Db)
  {
    this.db = appDb;
  }

  get dictionary()
  {
    return this.db.collection<DictionaryEntryInDb>("dictionary")
  }
}