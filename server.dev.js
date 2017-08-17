const fs = require('fs')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const reactExporter = require('./src/exporters/react')
const reactNativeExporter = require('./src/exporters/react-native')

app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.static('./static'))

const idsToNames = {}

fs.readdirSync('./ugnis_components/').forEach(file => {
    const definition = JSON.parse(fs.readFileSync('./ugnis_components/'+file, 'utf8'))
    idsToNames[definition.id] = file
    
    // export all components too
    fs.writeFile(definition.reactPath+ file.slice(0, -4) + "js", reactExporter(definition), function(err) {
        if(err) {
            return console.log(err);
        }
    });
    fs.writeFile(definition.reactNativePath+ file.slice(0, -4) + "js", reactNativeExporter(definition), function(err) {
        if(err) {
            return console.log(err);
        }
    });
    
})

app.post('/save/:id', (req, res)=> {
    fs.writeFile("./ugnis_components/"+ idsToNames[req.params.id], JSON.stringify(req.body, undefined, 4), function(err) {
        if(err) {
            return console.log(err);
        }
    });
    fs.writeFile(req.body.reactPath+ idsToNames[req.params.id].slice(0, -4) + "js", reactExporter(req.body), function(err) {
        if(err) {
            return console.log(err);
        }
    });
    fs.writeFile(req.body.reactNativePath+ idsToNames[req.params.id].slice(0, -4) + "js", reactNativeExporter(req.body), function(err) {
        if(err) {
            return console.log(err);
        }
    });
    res.send('OK')
})

app.post('/rename', (req, res)=> {
    let newName = req.body.newName
    let i = 1
    if(fs.existsSync("./ugnis_components/"+ newName + ".json")){
        while (true) {
            if (!fs.existsSync("./ugnis_components/"+ newName + '_' + i + ".json")) {
                newName = newName + '_' + i
                break
            }
            i++
        }
    }
    fs.renameSync('./ugnis_components/'+ idsToNames[req.body.oldId], './ugnis_components/'+ newName + ".json")
    res.send('OK')
    idsToNames[req.body.oldId] = newName + ".json"
})

app.post('/new/:name', (req, res)=> {
    let newName = req.params.name
    let i = 1
    if(fs.existsSync("./ugnis_components/"+ newName + ".json")){
        while (true) {
            if (!fs.existsSync("./ugnis_components/"+ newName + '_' + i + ".json")) {
                newName = newName + '_' + i
                break
            }
            i++
        }
    }
    fs.writeFile("./ugnis_components/"+ newName + ".json", JSON.stringify(req.body, undefined, 4), function(err) {
        if(err) {
            return console.log(err);
        }
    });
    res.send('OK')
    idsToNames[req.body.id] = newName + ".json"
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