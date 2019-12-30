const PORT = 8085

const express = require("express")
const app = express()
const http = require("http").Server(app)
const bodyParser = require("body-parser");
const ut = require("./utils.js")

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req: any, res: any) =>
{
  res.type("text/plain")
  res.end("welcome 6")
})
app.get("/edict/:word", (req: any, res: any) => {
  const word = req.params.word
  ut.log(word)
  res.type("text/plain")
  res.end(word)
})

http.listen(PORT, "0.0.0.0")
ut.log("Server running on port " + PORT)
