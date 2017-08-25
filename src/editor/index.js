import { listen } from 'lape'
import patch from './render'
import './state'
import root from './components/root'
import './undo'
import './server'

let node = document.getElementById('editor')

function render(state) {
     node = patch(node, root(state))
}

listen(render)
window.addEventListener('resize', render, false)
window.addEventListener('orientationchange', render, false)
