export const environment = {
  httpPort: 8085,
  mongodbUrl: process.env.MONGODB_URI || "mongodb://localhost:27017",
  mongodbName: "japaneseapi"
};