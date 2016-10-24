import ugnis from './ugnis'
import todoApp from '../ugnis_components/todo-app.json'

const app = ugnis(todoApp, document.getElementById('app'))






import devtools from '../ugnis_components/devtools.js'

let node = document.createElement('div')
document.body.appendChild(node)

const dev = ugnis(devtools, node)
app.addListener(dev.emitAction)