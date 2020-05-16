import { ObjectID } from "mongodb";

export interface Lemma
{
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

export class ApiWordOutput
{
  public lemmas: string[];
  public englishGlosses: string[];
  public japaneseGlosses: string[];

  constructor(entry: DictionaryEntryInDb)
  {
    const allDaijirinGlosses = entry.daijirinArticles.map(d => d.glosses).flat()

    this.lemmas = entry.lemmas.filter(l => !l.isConjugated).map(l => l.kanji + "（" + l.reading + "）")
    this.japaneseGlosses = allDaijirinGlosses.filter(g => !g.endsWith("→英和"))
    this.englishGlosses = entry.edictGlosses.concat(allDaijirinGlosses.filter(g => g.endsWith("→英和")))
  }
}

export interface ApiSentenceOutput
{
  word: string,
  dictionaryEntries: ApiWordOutput[],
}

export interface KanjidicEntry
{
  strokeCount: number
}

