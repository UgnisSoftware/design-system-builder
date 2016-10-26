import ugnis from './ugnis'
import devtools from './devtools'

import todoApp from '../ugnis_components/devtools.js'
const app = ugnis(document.getElementById('app'), todoApp)

devtools(app)