/*
 *  Ugnis differs from other programming languages and frameworks because we can update Ugnis components without users
 *  having to do any rewrites.
 *  
 *  This is a template on how to update all components in '/ugnis_components/'   
 * 
 */

const fs = require('fs')

function uuid() {
    //return ('' + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/[10]/g, function() {
    return ('' + 1e7).replace(/[10]/g, function() {
        return (0 | (Math.random() * 16)).toString(16)
    })
}

fs.readdirSync('../../ugnis_components/').forEach(file => {
    const oldJson = JSON.parse(fs.readFileSync('../../ugnis_components/'+file, 'utf8'))

    const newJson = {
        ...oldJson,
        version: oldJson.version, // don't forget to set this to an appropriate version
        
        // make changes here
    
    }

    fs.writeFile("../../ugnis_components/"+ file, JSON.stringify(newJson, undefined, 4), function(err) {
        if(err) {
            return console.log(err);
        }
    });
})