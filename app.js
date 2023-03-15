const express = require("express");
const { PORT, HOST } = require("./constants/index");
const { getTest } = require("./controllers/TestController")
const app = express()

app.get("/test", getTest)


app.listen(PORT, () => {
    console.log(`http://${HOST}:${PORT}`)
})