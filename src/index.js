import ugnis from './ugnis'
import editor from './editor/editor'

import savedApp from '../ugnis_components/app.json'

const app = ugnis(document.getElementById('app'), savedApp)
editor(app)