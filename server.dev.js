const fs = require('fs')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('./static_prod'))

app.post('/save/:name', (req, res)=> {
    fs.writeFile("./ugnis_components/"+ req.params.name + ".json", JSON.stringify(req.body, undefined, 4), function(err) {
        if(err) {
            return console.log(err);
        }
    });
    res.send('OK')
})

app.post('/rename', (req, res)=> {
    fs.rename('./ugnis_components/'+ req.body.oldName + ".json", './ugnis_components/'+ req.body.newName + ".json", function(err) {
        if ( err ) console.log('ERROR: ' + err);
    });
    res.send('OK')
})

app.post('/new/:name', (req, res)=> {
    fs.writeFile("./ugnis_components/"+ req.params.name + ".json", fs.readFileSync('./src/_empty.json', 'utf8'), function(err) {
        if(err) {
            return console.log(err);
        }
    });
    res.send('OK')
})

app.get('/definitions', (req, res)=> {
    let files = {}
    fs.readdirSync('./ugnis_components/').forEach(file => {
        files[file.slice(0, -5)] = JSON.parse(fs.readFileSync('./ugnis_components/'+file, 'utf8'))
    })
    res.send(JSON.stringify(files))
})

app.listen(3000, ()=> {
    console.log('Listening on port 3000')
})