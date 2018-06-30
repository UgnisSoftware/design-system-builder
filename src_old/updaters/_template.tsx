/*
 *  Ugnis differs from other programming languages and frameworks because we can update Ugnis components without users
 *  having to do any rewrites.
 *
 *  This is a template on how to update all components in '/ugnis_components/'
 *
 *  1. Write transforms
 *  2. Update docs
 *
 */
import * as fs from 'fs'

fs.readdirSync('../../ugnis_components/').forEach(file => {
    const oldJson = JSON.parse(fs.readFileSync('../../ugnis_components/' + file, 'utf8'))
    const newJson = {
        ...oldJson,
        version: oldJson.version,
    }
    fs.writeFile('../../ugnis_components/' + file, JSON.stringify(newJson, undefined, 4), function(err) {
        if (err) {
            return console.log(err)
        }
    })
})
