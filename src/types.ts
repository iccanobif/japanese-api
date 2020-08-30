import { ObjectID } from "mongodb";
import { isEnglishGloss } from "./utils";

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
  accents: string[],
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
  accents: string[],
  sampleSentences: string[],
  partOfSpeech: string[],
}

export class ApiWordOutput
{
  public lemmas: { kanji: string, reading: string }[];
  public englishGlosses: string[];
  public japaneseGlosses: string[];
  public accents: string[];
  public sampleSentences: string[];
  public partOfSpeech: string[];

  constructor(entry: DictionaryEntryInDb)
  {
    const allDaijirinGlosses = entry.daijirinArticles.map(d => d.glosses).flat()

    this.lemmas = entry.lemmas.filter(l => !l.isConjugated).map(l => ({ kanji: l.kanji, reading: l.reading }))
    this.japaneseGlosses = allDaijirinGlosses.filter(g => !isEnglishGloss(g))
    this.englishGlosses = entry.edictGlosses.concat(allDaijirinGlosses.filter(g => isEnglishGloss(g)))
    this.accents = entry.accents;
    this.sampleSentences = entry.sampleSentences;
    this.partOfSpeech = entry.partOfSpeech;
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

export interface MobiFileEntry
{
  // The title is x in <idx:orth value="x">x</idx:orth>
  // it seems that the content of the "value" attribute and
  // the data between the tags is always the same except for 
  // capitalization inconsistencies
  titles: string[],
  contentLines: string[]
}

export interface AccentDictionaryEntry
{
  keys: string[],
  pronounciations: string[],
  sampleSentences: string[],
}