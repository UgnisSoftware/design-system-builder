const { statSync, readdirSync, writeFile, readFileSync } = require('fs')
const { join } = require('path')

const reactExporter = require('./src/exporters/react')
const reactNativeExporter = require('./src/exporters/react-native')

const isNotDirectory = f => !statSync(join(__dirname, './ugnis_components/', f)).isDirectory()

readdirSync('./ugnis_components/').filter(isNotDirectory).forEach(file => {
    const definition = JSON.parse(readFileSync('./ugnis_components/'+file, 'utf8'))
    
    // export all components to React
    writeFile(definition.reactPath+ file.slice(0, -4) + "js", reactExporter(definition), function(err) {
        if(err) {
            return console.log(err);
        }
    });
    //  export all components to React Native
    writeFile(definition.reactNativePath + file.slice(0, -4) + "js", reactNativeExporter(definition),
        function(err) {
            if(err) {
                return console.log(err);
            }
        });
})