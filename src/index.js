const PORT = 8085

const express = require("express")
const app = express()
const http = require("http").Server(app)
const bodyParser = require("body-parser");
const ut = require("./utils.js")

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) =>
{
  res.type("text/plain")
  res.end("welcome 2")
})

http.listen(PORT, "0.0.0.0")
ut.log("Server running on port " + PORT)
