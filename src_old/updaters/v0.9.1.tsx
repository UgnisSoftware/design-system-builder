import * as fs from 'fs'

fs.readdirSync('../../ugnis_components/').forEach(file => {
    const oldJson = JSON.parse(fs.readFileSync('../../ugnis_components/' + file, 'utf8'))
    const newJson = {
        ...oldJson,
        version: '0.9.1',
        row: {},
        column: {},
        push: {},
    }
    fs.writeFile('../../ugnis_components/' + file, JSON.stringify(newJson, undefined, 4), function(err) {
        if (err) {
            return console.log(err)
        }
    })
})
