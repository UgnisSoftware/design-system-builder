import * as fs from 'fs'
import { uuid } from '../editor/utils'

fs.readdirSync('../../ugnis_components/').forEach(file => {
    const oldJson = JSON.parse(fs.readFileSync('../../ugnis_components/' + file, 'utf8'))
    const newJson = Object.keys(oldJson.style).reduce((acc, key) => {
        const newPipeId = uuid()
        acc = {
            ...acc,
            pipe: {
                ...acc.pipe,
                [newPipeId]: {
                    type: 'text',
                    value: '',
                    transformations: [],
                },
            },
            style: {
                ...acc.style,
                [key]: {
                    ...acc.style[key],
                    transition: {
                        ref: 'pipe',
                        id: newPipeId,
                    },
                },
            },
        }
        return acc
    }, oldJson)
    fs.writeFile('../../ugnis_components/' + file, JSON.stringify(newJson, undefined, 4), function(err) {
        if (err) {
            return console.log(err)
        }
    })
})
