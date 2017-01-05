import snabbdom from 'snabbdom'
const patch = snabbdom.init([
    require('snabbdom/modules/class'),
    require('snabbdom/modules/props'),
    require('snabbdom/modules/style'),
    require('snabbdom/modules/eventlisteners'),
    require('snabbdom/modules/attributes'),
]);
import h from 'snabbdom/h';

export default (app)=>{

    const wrapper = document.createElement('div');
    app.vdom.elm.parentNode.appendChild(wrapper);
    wrapper.appendChild(app.vdom.elm);

    let node = document.createElement('div')
    document.body.appendChild(node)

    wrapper.style.width = 'calc(100% - 350px)'
    wrapper.style.position = 'relative'
    wrapper.style.transition = '0.5s width'

    // State
    let state = {
        open: true,
        appIsFrozen: false,
        selectedViewNode: '',
        viewFoldersClosed: {},
        app: app.definition,
    }
    // undo/redo
    let stateStack = [state]
    function setState(newState, pushToStack = false){
        if(newState === state){
            console.warn('state was mutated, search for a bug')
        }
        // some actions should not be recorded and controlled through undo/redo
        if(pushToStack){
            const currentIndex = stateStack.findIndex((a)=>a===state)
            stateStack = stateStack.slice(0, currentIndex+1).concat(newState);
        } else {
            stateStack[stateStack.length-1] = newState;
        }
        if(state.appIsFrozen !== newState.appIsFrozen || state.selectedViewNode !== newState.selectedViewNode ){
            app._freeze(newState.appIsFrozen, VIEW_NODE_SELECTED, newState.selectedViewNode)
        }
        state = newState;
        render()
    }
    document.addEventListener('keydown', (e)=>{
        // 83 - s
        // 90 - z
        // 89 - y
        if(e.which == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            e.preventDefault();
            fetch('/save', {method: 'POST', body: JSON.stringify(state.app), headers: {"Content-Type": "application/json"}})
            return false;
        }
        if(e.which == 90 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            const currentIndex = stateStack.findIndex((a)=>a===state)
            if(currentIndex > 0){
                state = stateStack[currentIndex-1]
                render()
            }
        }
        if(e.which == 89 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            const currentIndex = stateStack.findIndex((a)=>a===state)
            if(currentIndex < stateStack.length-1){
                state = stateStack[currentIndex+1]
                render()
            }
        }
    })

    // Actions
    function ARROW_CLICKED() {
        setState({...state, open: !state.open}, false)
        if(state.open){
            wrapper.style.width = 'calc(100% - 350px)'
        }
        else {
            wrapper.style.width = '100%'
        }
    }
    function FREEZER_CLICKED() {
        setState({...state, appIsFrozen: !state.appIsFrozen}, false)
    }
    function VIEW_FOLDER_CLICKED(nodeId) {
        setState({...state, viewFoldersClosed:{...state.viewFoldersClosed, [nodeId]: !state.viewFoldersClosed[nodeId]}})
    }
    function VIEW_NODE_SELECTED(nodeId) {
        setState({...state, selectedViewNode:nodeId})
    }
    function DELETE_SELECTED_VIEW(nodeId, parentId, e) {
        // TODO rethink
        e.stopPropagation()
        if(nodeId === '_rootNode'){
            state.app.nodes['_rootNode'].childrenIds = []
        } else {
            delete state.app.nodes[nodeId]
            state.app.nodes[parentId].childrenIds = state.app.nodes[parentId].childrenIds.filter((id)=> id !== nodeId)
        }
        app.render();
        render();
    }

    // Render
    function render() {

        const arrowComponent = h('div', {
            on: {
                click: ARROW_CLICKED
            },
            style: {
                position: 'absolute',
                left: '0',
                transform: 'translateX(-100%)',
                padding: '15px 15px 15px 15px',
                borderRadius: '5px 0 0 5px',
                top: '30px',
                width: '20px',
                textAlign: 'center',
                fontSize: '1em',
                background: '#4d4d4d',
                cursor: 'pointer',
                transition: 'all 0.5s',
            },
        }, [h('svg', {
                attrs: {width: 12, height: 16},
                style: { cursor: 'pointer', padding: '0 5px', transform: state.open ? 'rotate(0deg)': 'rotate(180deg)'},
            },
            [h('polygon', {attrs: {points: '12,8 0,1 3,8 0,15', fill: 'white'}})])])
        const freezeComponent = h('div', {
            on: {
                click: FREEZER_CLICKED
            },
            style: {
                position: 'absolute',
                left: '0',
                transform: 'translateX(-100%)',
                padding: '15px 15px 15px 15px',
                borderRadius: '5px 0 0 5px',
                top: '100px',
                width: '20px',
                textAlign: 'center',
                fontSize: '1em',
                background: '#4d4d4d',
                cursor: 'pointer',
                transition: 'all 0.5s',
            },
        }, state.appIsFrozen ? '►': '❚❚',)
        const stateComponent = h('div', {
            style: {
                flex: '1',
            }
        }, 'State')
        function listNodes(nodeId, parentId) {
            const node = state.app.nodes[nodeId]
            if(node._type === 'vNode'){
                if(node.nodeType === 'box'){
                    const closed = state.viewFoldersClosed[nodeId]
                    return h('div', {
                            style: {
                                background: state.selectedViewNode === nodeId ? '#828183': '',
                                position: 'relative',
                            }
                        }, [
                            h('svg', {
                                    attrs: {width: 12, height: 16},
                                    style: { cursor: 'pointer', padding: '0 5px', transform: closed ? 'rotate(0deg)': 'rotate(90deg)'},
                                    on: {
                                        click: [VIEW_FOLDER_CLICKED, nodeId]
                                    },
                                },
                                [h('polygon', {attrs: {points: '12,8 0,1 3,8 0,15', fill: 'white'}})]),
                            h('span', { style: { cursor: 'pointer'}, on: {click: [VIEW_NODE_SELECTED, nodeId]}},node.nodeType),
                            h('div', {style: { display: closed ? 'none': 'block', marginLeft: '10px', paddingLeft: '10px', borderLeft:'1px solid white'}}, node.childrenIds.map((id)=> listNodes(id, nodeId))),
                            h('div', {style: {display: state.selectedViewNode === nodeId ? 'block': 'none' ,position: 'absolute', right: '5px', top: '0'}, on: {click: [DELETE_SELECTED_VIEW, nodeId, parentId]}}, 'x')
                        ]
                    )
                } else {
                    return h('div', {
                            style: {
                                cursor: 'pointer',
                                background: state.selectedViewNode === nodeId ? '#828183': '',
                                position: 'relative'
                            },
                            on: {click: [VIEW_NODE_SELECTED, nodeId]}
                        }, [
                            node.nodeType,
                            h('div', {style: {display: state.selectedViewNode === nodeId ? 'block': 'none' ,position: 'absolute', right: '5px', top: '0'}, on: {click: [DELETE_SELECTED_VIEW, nodeId, parentId]}}, 'x')
                        ]
                    )
                }
            }
        }
        const viewComponent = h('div', {
            style: {
                flex: '1',
                borderTop: '3px solid #333333',
                padding: '5px',
            }
        }, [listNodes('_rootNode')])

        const vnode =
            h('div', {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    color: '#dddddd',
                    fontWeight: '300',
                    fontSize: '1.5em',
                    position: 'fixed',
                    top: '0',
                    right: '0',
                    width: '350px',
                    height: '100vh',
                    background: '#4d4d4d',
                    boxSizing: "border-box",
                    borderLeft: '3px solid #333333',
                    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                    transition: '0.5s transform',
                    transform: state.open ? 'translateX(0%)': 'translateX(100%)',
                },
            }, [
                arrowComponent,
                freezeComponent,
                stateComponent,
                viewComponent,
            ])

        node = patch(node, vnode)
    }

    render()
}