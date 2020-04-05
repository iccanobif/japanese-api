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

export interface DaijirinEntryFromFile
{
  key: string,
  lemma: string,
  glosses: string[],
}

export interface DictionaryEntryInDb
{
  lemmas: Lemma[],
  edictGlosses: string[],
  daijirinGlosses: string[],
}

export interface DictionaryApiOutput
{
  glosses: string[]
}