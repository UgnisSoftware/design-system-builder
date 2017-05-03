const fs = require('fs')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const exec = require('child_process').exec

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));

app.post('/super_secret_github_update', (req, res)=> {
    exec('git pull')
    exec('npm run compile')
    res.send('OK')
})

app.listen(3031, ()=> {
    console.log('Listening on port 3000')
})