export interface KanjiReadingLink
{
  kanjiElement: string,
  readingElement: string,
}

export interface EdictEntryFromFile
{
  entrySequence: number, // Unique entry identifier
  unconjugatedReadingLinks: KanjiReadingLink[],
  conjugatedReadingLinks: KanjiReadingLink[],
  partOfSpeech: string[],
  glosses: string[],
  allKeys: string[],
}

export interface DaijirinEntryFromFile
{
  key: string,
  lemma: string,
  glosses: string[],
}

export interface DictionaryEntryInDb
{
  lemmas: {
    kanji: string,
    reading: string,
    isConjugated: boolean,
  }
  edictGlosses: string[],
  daijirinGlosses: string[],
}