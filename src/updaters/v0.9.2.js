const fs = require('fs')
const collectGarbage = require('../garbage-collector.js')

function uuid() {
    //return ('' + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/[10]/g, function() {
    return ('' + 1e7).replace(/[10]/g, function() {
        return (0 | (Math.random() * 16)).toString(16)
    })
}

fs.readdirSync('../../ugnis_components/').forEach(file => {
    const filePath = `../../ugnis_components/${file}`
    const oldJson = JSON.parse(fs.readFileSync(filePath, 'utf8'))

    const cleanDefinition = collectGarbage(oldJson)

    const newJson = Object.keys(cleanDefinition.style).reduce((acc, key) => {
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
                    transform: {
                        ref: 'pipe',
                        id: newPipeId,
                    },
                },
            },
        }
        return acc
    }, cleanDefinition)

    fs.writeFile(filePath, JSON.stringify(newJson, undefined, 4), error => {
        if (error) {
            console.log(error)
        }
    })
})
