const PORT = 8085

import express from "express";
const app: express.Application = express()

const bodyParser = require("body-parser");
import { log } from "./utils";

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req: any, res: any) => {
  res.type("text/plain")
  res.end("welcome in typescript")
})

app.get("/edict/:word", (req: any, res: any) => {
  const word = req.params.word
  log(word)
  res.type("text/plain")
  res.end(word)
})

const server = app.listen(PORT, "0.0.0.0")
log("Server running on port " + PORT)

export default server