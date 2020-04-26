import { ObjectID } from "mongodb";

export interface Lemma {
  kanji: string,
  reading: string,
  isConjugated: boolean,
}

export interface EdictEntryFromFile
{
  entrySequence: number, // Unique entry identifier
  lemmas: Lemma[],
  partOfSpeech: string[],
  glosses: string[],
}

export interface DaijirinEntryFromOriginalFile
{
  key: string,
  lemma: string,
  glosses: string[],
}

export interface DaijirinEntryFromIntermediateFile
{
  keys: string[],
  lemma: string,
  glosses: string[],
}

export interface DictionaryEntryInDb
{
  _id: ObjectID,
  lemmas: Lemma[],
  edictGlosses: string[],
  daijirinArticles: {
    lemma: string,
    glosses: string[],
  }[]
  allKeys: string[],
  allUnconjugatedKeys: string[],
  allConjugatedKeys: string[],
}

export interface DictionaryApiOutput
{
  lemmas: string[],
  glosses: string[],
}

export interface KanjidicEntry
{
  strokeCount: number
}