var snabbdom = require('snabbdom');
var patch = snabbdom.init([ // Init patch function with choosen modules
    require('snabbdom/modules/class'), // makes it easy to toggle classes
    require('snabbdom/modules/props'), // for setting properties on DOM elements
    require('snabbdom/modules/style'), // handles styling on elements with support for animations
    require('snabbdom/modules/eventlisteners'), // attaches event listeners
]);
var h = require('snabbdom/h'); // helper function for creating vnodes

var state = {
    test: hi
}

var actions = {
    testy: (e) => 'hi'
}

var vnode = h('div#container.two.classes', {on: {click: redux.dispatch({type: click, action: actions.testy})}}, [
    h('span', {style: {fontWeight: 'bold'}}, 'This is bold'),
    ' and this is just normal text',
    h('a', {props: {href: '/foo'}}, 'I\'ll take you places!')
]);

var container = document.getElementById('container');
// Patch into empty DOM element – this modifies the DOM as a side effect
patch(container, vnode);

var newVnode = h('div#container.two.classes', {on: {click: anotherEventHandler}}, [
    h('span', {style: {fontWeight: 'normal', fontStyle: 'italic'}}, 'This is now italic type'),
    ' and this is still just normal text',
    h('a', {props: {href: '/bar'}}, 'I\'ll take you places!')
]);
// Second `patch` invocation
// redux.subscribe
patch(vnode, newVnode); // Snabbdom efficiently updates the old view to the new state