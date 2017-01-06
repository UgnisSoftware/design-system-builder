import snabbdom from 'snabbdom'
const patch = snabbdom.init([
    require('snabbdom/modules/class'),
    require('snabbdom/modules/props'),
    require('snabbdom/modules/style'),
    require('snabbdom/modules/eventlisteners'),
    require('snabbdom/modules/attributes'),
]);
import h from 'snabbdom/h';

const uuid = require('node-uuid')

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
        definition: app.definition,
    }
    // undo/redo
    let stateStack = [state]
    function setState(newState, pushToStack){
        if(newState === state){
            console.warn('state was mutated, search for a bug')
        }
        // some actions should not be recorded and controlled through undo/redo
        if(pushToStack){
            const currentIndex = stateStack.findIndex((a)=>a===state)
            stateStack = stateStack.slice(0, currentIndex+1).concat(newState);
        } else {
            // overwrite current
            stateStack[stateStack.findIndex((a)=>a===state)] = newState;
        }
        if(state.appIsFrozen !== newState.appIsFrozen || state.selectedViewNode !== newState.selectedViewNode ){
            app._freeze(newState.appIsFrozen, VIEW_NODE_SELECTED, newState.selectedViewNode)
        }
        if(state.definition !== newState.definition){
            app.render(newState.definition)
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
            fetch('/save', {method: 'POST', body: JSON.stringify(state.definition), headers: {"Content-Type": "application/json"}})
            return false;
        }
        if(e.which == 90 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            const currentIndex = stateStack.findIndex((a)=>a===state)
            if(currentIndex > 0){
                const newState = stateStack[currentIndex-1]
                if(state.definition !== newState.definition){
                    app.render(newState.definition)
                }
                state = newState
                render()
            }

        }
        if(e.which == 89 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            const currentIndex = stateStack.findIndex((a)=>a===state)
            if(currentIndex < stateStack.length-1){
                const newState = stateStack[currentIndex+1]
                if(state.definition !== newState.definition){
                    app.render(newState.definition)
                }
                state = newState
                render()
            }
        }
    })

    // Actions
    function ARROW_CLICKED() {
        setState({...state, open: !state.open})
        if(state.open){
            wrapper.style.width = 'calc(100% - 350px)'
        }
        else {
            wrapper.style.width = '100%'
        }
    }
    function FREEZER_CLICKED() {
        setState({...state, appIsFrozen: !state.appIsFrozen})
    }
    function VIEW_FOLDER_CLICKED(nodeId) {
        setState({...state, viewFoldersClosed:{...state.viewFoldersClosed, [nodeId]: !state.viewFoldersClosed[nodeId]}})
    }
    function VIEW_NODE_SELECTED(nodeId) {
        setState({...state, selectedViewNode:nodeId})
    }
    function DELETE_SELECTED_VIEW(nodeId, parentId, e) {
        e.stopPropagation()
        if(nodeId === '_rootNode'){
            // immutably remove all nodes except rootNode
            return setState({...state, definition: {
                ...state.definition,
                nodes: {'_rootNode': {...state.definition.nodes['_rootNode'], childrenIds: []}},
                styles: {'_rootStyle': state.definition.styles['_rootStyle']}
            }}, true)
        }
        // traverse the tree and leave only used nodes - Garbage collection
        const newNodes = {}
        const newStyles = {}
        function addNode(addNodeId) {
            let newNode = state.definition.nodes[addNodeId]
            if(parentId === addNodeId){
                newNode = {...newNode, childrenIds:newNode.childrenIds.filter((a)=>a!==nodeId)}
            }
            newNodes[addNodeId] = newNode
            const newStyleId = newNode.styleId
            newStyles[newStyleId] = state.definition.styles[newStyleId]
            if(newNode.childrenIds){
                newNode.childrenIds.forEach(addNode)
            }
        }
        addNode('_rootNode')
        setState({...state, definition: {
            ...state.definition,
            nodes: newNodes,
            styles: newStyles,
        }}, true)
    }
    function ADD_NODE(nodeId, type) {
        const newNodeId = uuid.v4()
        const newStyleId = uuid.v4()
        let newNode;
        if(type === 'box') {
            newNode = {
                _type: 'vNode',
                nodeType: type,
                styleId: newStyleId,
                childrenIds: []
            }
        }
        if(type === 'text') {
            newNode = {
                _type: 'vNode',
                nodeType: type,
                styleId: newStyleId,
                value: 'Default Text'
            }
        }
        if(type === 'input') {
            // TODO add state
            newNode = {
                _type: 'vNode',
                nodeType: type,
                styleId: newStyleId,
                value: 'Default Text'
            }
        }
        const newStyle = {
            padding: '10px',
        }
        setState({...state, definition: {
            ...state.definition,
            nodes: {...state.definition.nodes, [nodeId]: {...state.definition.nodes[nodeId], childrenIds: state.definition.nodes[nodeId].childrenIds.concat(newNodeId)}, [newNodeId]: newNode},
            styles: {...state.definition.styles, [newStyleId]: newStyle},
        }}, true)
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
            const node = state.definition.nodes[nodeId]
            if(node._type === 'vNode'){
                if(node.nodeType === 'box'){
                    const closed = state.viewFoldersClosed[nodeId]
                    return h('div', {
                            style: {
                                outline: state.selectedViewNode === nodeId ? '3px solid #3590df': '',
                                transition:'outline 0.1s',
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
                            h('div', {style: {display: state.selectedViewNode === nodeId ? 'block': 'none', position: 'absolute', right: '5px', top: '0'}, on: {click: [DELETE_SELECTED_VIEW, nodeId, parentId]}}, 'x'),
                            h('span', {style: {display: state.selectedViewNode === nodeId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid white', padding: '5px', margin: '5px'}, on: {click: [ADD_NODE, nodeId, 'box']}}, '+ box'),
                            h('span', {style: {display: state.selectedViewNode === nodeId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid white', padding: '5px', margin: '5px'}, on: {click: [ADD_NODE, nodeId, 'text']}}, '+ text'),
                            h('span', {style: {display: state.selectedViewNode === nodeId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid white', padding: '5px', margin: '5px'}, on: {click: [ADD_NODE, nodeId, 'input']}}, '+ input'),
                        ]
                    )
                } else {
                    return h('div', {
                            style: {
                                cursor: 'pointer',
                                transition:'outline 0.1s',
                                outline: state.selectedViewNode === nodeId ? '3px solid #3590df': '',
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