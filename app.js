const express = require('express')
const app = express()
app.use(express.json());

app.listen(3344);

const memoRouter = require('./routes/memo-api') 

app.use("/notes", memoRouter)
