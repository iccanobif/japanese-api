const PORT = 8085

const express = require("express")
const app = express()
const http = require("http").Server(app)
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.type("text/plain")
    res.end("welcome")
})

http.listen(PORT, "0.0.0.0")
console.log("Server running on port " + PORT)
