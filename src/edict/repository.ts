// export function isLoaded() {
//   return _isLoaded
// }

// export function isJapaneseWord(word: string) {
//   return word in dictionary
// }

// export function getDefinitions(word: string) {
//   if (word in dictionary)
//     return dictionary[word]
//   else
//     return []
// }

// const exceptions: { [key: string]: string[] } = {
//   "私": ["わたし"],
//   "彼": ["かれ"],
//   "彼の": ["かれの"],
//   "物": ["もの"],
//   "母": ["はは"],
//   "僕": ["ぼく"],
//   "０": ["０"],
//   "１": ["１"],
//   "２": ["２"],
//   "３": ["３"],
//   "４": ["４"],
//   "５": ["５"],
//   "６": ["６"],
//   "７": ["７"],
//   "８": ["８"],
//   "９": ["９"],
//   "・": ["・"]
// }

// export function getReadings(word: string, doFiltering: boolean): string[] {
//   if (doFiltering) {
//     // For a few very common words that happen to also have a lot of uncommon readings (私 probably being 
//     // the worst offender) or that have many common readings but that are unlikely to be the right ones
//     // when looking for that word by itself (物 for example wouldn't normally be ぶつ, when alone) ignore
//     // the dictionary and just return some hardcoded readings.    
//     if (word in exceptions) return exceptions[word]
//   }

//   if (word in kanjiToReadingsDictionary)
//     return Array.from(kanjiToReadingsDictionary[word])
//   else
//     return [word]
// }

// export function getBaseForms(conjugatedWord: string): string[] {
//   if (conjugatedWord in conjugatedToUnconjugatedFormsDictionary)
//     return Array.from(conjugatedToUnconjugatedFormsDictionary[conjugatedWord])
//   else
//     return [conjugatedWord] // It's not really conjugated, after all
// }

// export function addLoadedCallback(callback: () => void) {
//   if (_isLoaded)
//     callback()
//   else
//     callbacks.push(callback)
// }
