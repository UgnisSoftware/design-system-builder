function updateProps(oldVnode, vnode) {
    let key, cur, old, props = vnode.data.liveProps || {}
    for (key in props) {
        cur = props[key]
        old = vnode.elm[key]
        if (old !== cur) vnode.elm[key] = cur
    }
}
import snabbdom from 'snabbdom'
const patch = snabbdom.init([
    require('snabbdom/modules/class'),
    require('snabbdom/modules/props'),
    require('snabbdom/modules/style'),
    require('snabbdom/modules/eventlisteners'),
    require('snabbdom/modules/attributes'),
    { create: updateProps, update: updateProps },
])

export default patch