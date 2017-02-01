const fs = require('fs')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const spawn = require('child_process').spawn

app.use(bodyParser.json())
app.use(express.static('./static_prod'))

app.post('/_github_update', (req, res)=> {
    spawn('git pull')
    res.send('OK')
})

app.listen(3000, ()=> {
    console.log('Listening on port 3000')
})
