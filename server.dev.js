const fs = require('fs')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('./static_prod'))

app.post('/save', (req, res)=> {
    fs.writeFile("./ugnis_components/app-" + uuid.v4() + '.json', JSON.stringify(req.body, undefined, 4), function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
    res.send('OK')
})

app.listen(3000, ()=> {
    console.log('Listening on port 3000')
})