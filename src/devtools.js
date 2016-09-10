import snabbdom from 'snabbdom'
const patch = snabbdom.init([
    require('snabbdom/modules/class'),
    require('snabbdom/modules/props'), // for setting properties on DOM elements
    require('snabbdom/modules/style'), // handles styling on elements with support for animations
    require('snabbdom/modules/eventlisteners'), // attaches event listeners
]);

function init(definitions, currentState, renderApp){
    console.log('todo')
    let node = document.createElement('div')
    document.body.appendChild(node)
    
    const state = {
        isOpen: false
    }
    
    function openMenu(){
        state.isOpen = !state.isOpen
        render();
    }
    
    function vdom() {
        return {
            sel: 'div',
            data: {
                style: {
                    position: 'absolute',
                    right: '0',
                    top: '0px',
                    height: '100vh',
                },
                on: {
                    click: openMenu
                }
            },
            children: [
                {
                    sel: 'div',
                    data: {
                        style: {
                            position: 'absolute',
                            transform: 'rotate(180deg)',
                            writingMode: 'vertical-lr',
                            right: state.isOpen ? '500px' : '0px',
                            padding: '15px 5px 15px 5px',
                            borderRadius: '0px 5px 5px 0px',
                            top: '40px',
                            fontSize: '2em',
                            background: '#4d4d4d',
                            color: '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.5s',
                        },
                    },
                    text:  state.isOpen ? 'Close devtools' : 'Open devtools',
                },
                {
                    sel: 'div',
                    data: {
                        style: {
                            position: 'absolute',
                            right: state.isOpen ? '0px' : '-500px',
                            width: '500px',
                            height: '100vh',
                            top: '0',
                            background: '#ffffff',
                            transition: 'all 0.5s',
                        },
                    },
                    text: 'Hi',
                },
            ],
        }
    }
    
    function render(){
        const newDom = vdom()
        patch(node, newDom)
        node = newDom
    }
    
    render()
}

function emit(action, event, newState, mutations){
    console.log('todo')
}

export default {init, emit}