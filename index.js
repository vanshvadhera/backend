const connectToMongo = require('./db');
const express = require('express');
const { application } = require('express');
var cors = require('cors')

connectToMongo();
const app = express()
const port = 3003

app.use(cors())
app.use(express.json())

//Availabe Routes  
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes',require('./routes/notes'))

app.listen(port, () => {
    console.log(`iNotebook backend listening on port ${port}`)
})