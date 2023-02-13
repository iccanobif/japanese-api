export const environment = {
  httpPort: process.env.PORT == undefined 
            ? 8085
            : Number.parseInt(process.env.PORT),
  mongodbUrl: process.env.MONGODB_URI || "mongodb://localhost:27017/japaneseapi",
  dictionaryIframeUrl: process.env.DICTIONARY_IFRAME_URL as string,
  bookDirectory: process.env.BOOK_DIRECTORY || "uploaded-books"
};