function updateProps(oldVnode, vnode) {
    let key,
        cur,
        old,
        props = vnode.data.liveProps || {}
    for (key in props) {
        cur = props[key]
        old = vnode.elm[key]
        if (old !== cur) vnode.elm[key] = cur
    }
}
import snabbdom from 'snabbdom'
const patch = snabbdom.init([require('snabbdom/modules/class'), require('snabbdom/modules/props'), require('snabbdom/modules/style'), require('snabbdom/modules/eventlisteners'), require('snabbdom/modules/attributes'), { create: updateProps, update: updateProps }])

import {listen} from './state'
import {FREEZER_CLICKED} from './events'
import root from './components/root'
import './undo'
import './server'

let node = document.getElementById('editor')

// render once per frame max
let currentAnimationFrameRequest = null
function render(){
    if (currentAnimationFrameRequest === null) {
        currentAnimationFrameRequest = window.requestAnimationFrame(()=>{
            node = patch(node, root())
            currentAnimationFrameRequest = null
        })
    }
}

listen(render)
window.addEventListener('resize', render, false)
window.addEventListener('orientationchange', render, false)

// hack to start frozen
FREEZER_CLICKED()