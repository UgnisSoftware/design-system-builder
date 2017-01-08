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
        selectedStateNode: '',
        activeAction: '',
        viewFoldersClosed: {},
        definition: app.definition,
        currentState: app.currentState
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
    function STATE_NODE_SELECTED(nodeId) {
        setState({...state, selectedStateNode:nodeId})
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
    function CHANGE_STYLE(styleId, key, e) {
        e.preventDefault()
        // and now I really regret not using immutable or ramda lenses
        setState({...state, definition: {...state.definition, styles: {...state.definition.styles, [styleId]: {...state.definition.styles[styleId], [key]: e.target.value}}}}, true)
    }
    function ADD_DEFAULT_STYLE(styleId, key) {
        setState({...state, definition: {...state.definition, styles: {...state.definition.styles, [styleId]: {...state.definition.styles[styleId], [key]: 'default'}}}}, true)
    }

    // Listen to app and blink every action
    let timer = null
    app.addListener((eventName, data, e, previousState, currentState, mutations)=>{
        setState({...state, activeAction: eventName, currentState})
        // yeah, I probably needed some observables too
        if(timer){
            clearTimeout(timer)
        }
        timer = setTimeout(()=> {
            setState({...state, activeAction: ''})
        }, 500)
    })

    // Render
    function render() {
        const arrowComponent = h('div', {
            on: {
                click: ARROW_CLICKED
            },
            style: {
                position: 'absolute',
                left: '-3px',
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
                left: '-3px',
                transform: 'translateX(-100%)',
                borderRadius: '5px 0 0 5px',
                top: '100px',
                width: '50px',
                textAlign: 'center',
                fontSize: '1em',
                background: '#4d4d4d',
                cursor: 'pointer',
                transition: 'all 0.2s',
            },
        }, [
            h('div', {style: {padding: '15px 15px 10px 15px', borderBottom: '1px solid #333333', color: state.appIsFrozen ? 'rgb(204, 91, 91)': 'rgb(91, 204, 91)'}}, state.appIsFrozen ? '❚❚': '►'),
            h('div', {style: {padding: '4px 17px', fontSize: '0.8em',color: '#929292'}}, state.appIsFrozen ? '►': '❚❚')
        ])
        function listState(stateId, parentId) {
            const currentState = state.definition.state[stateId]
            if(currentState.stateType === 'nameSpace') {
                const closed = state.viewFoldersClosed[stateId]
                return h('div', {
                        style: {
                            position: 'relative',
                        }
                    }, [
                        h('svg', {
                                attrs: {width: 12, height: 16},
                                style: { cursor: 'pointer', padding: '0 5px', transform: closed ? 'rotate(0deg)': 'rotate(90deg)'},
                                on: {
                                    click: [VIEW_FOLDER_CLICKED, stateId]
                                },
                            },
                            [h('polygon', {attrs: {points: '12,8 0,1 3,8 0,15', fill:  state.selectedStateNode === stateId ? '#eab65c': 'white'}})]),
                        h('span', { style: { cursor: 'pointer'}, on: {click: [STATE_NODE_SELECTED, stateId]}}, state.selectedStateNode === stateId ? [h('span', {style: {color: '#eab65c'}}, currentState.title)] : currentState.title),
                        h('div', {style: { display: closed ? 'none': 'block', marginLeft: '10px', paddingLeft: '5px', borderLeft: state.selectedStateNode === stateId ? '1px solid #eab65c' :'1px solid white'}}, [
                            ...currentState.childrenIds.map((id)=> listState(id, stateId))
                        ]),
                    ]
                )
            }
            return h('div', {
                    style: {
                        paddingLeft: '5px',
                        cursor: 'pointer',
                        position: 'relative'
                    },
                },
                [
                    h('span', {style: {color: state.selectedStateNode === stateId ? '#eab65c': 'white'}, on: {click: [STATE_NODE_SELECTED, stateId]}}, [currentState.title+ ': ', h('span', {style: {color: 'rgb(91, 204, 91)'}}, state.currentState[stateId])]),
                    ...Object.keys(currentState.mutators).map(key =>
                        h('div', [
                            h('svg', {
                                    attrs: {width: 16, height: 16},
                                    style: { cursor: 'pointer', padding: '0 5px', transform: 'rotate(-90deg)'},
                                },
                                [
                                    h('polygon', {attrs: {points: '16,8 4,1 7,8 4,15', fill:  state.activeAction === key ? 'rgb(91, 204, 91)': 'white'}, style:{transition: 'all 0.2s'}}),
                                    h('polygon', {attrs: {points: '8,6 8,10 3,10 3,16 0,16 0,6', fill:  state.activeAction === key ? 'rgb(91, 204, 91)': 'white'}, style:{transition: 'all 0.2s'}})
                                ]),
                            h('span', {style: {color: state.activeAction === key ? 'rgb(91, 204, 91)': 'white', transition: 'all 0.2s'}}, key)
                        ])
                    )
                ]
            )
        }
        const stateComponent = h('div', {
            style: {
                flex: '1',
                padding: '5px',
            }
        }, [listState('_rootState')])
        function listNodes(nodeId, parentId) {
            const node = state.definition.nodes[nodeId]
            if(node._type === 'vNode'){
                if(node.nodeType === 'box'){
                    const closed = state.viewFoldersClosed[nodeId]
                    return h('div', {
                            style: {
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
                                [h('polygon', {attrs: {points: '12,8 0,1 3,8 0,15', fill:  state.selectedViewNode === nodeId ? '#53B2ED': 'white'}})]),
                            h('span', { style: { cursor: 'pointer'}, on: {click: [VIEW_NODE_SELECTED, nodeId]}}, state.selectedViewNode === nodeId ? [h('span', {style: {color: '#53B2ED'}}, node.nodeType)] : node.nodeType),
                            h('div', {style: { display: closed ? 'none': 'block', marginLeft: '10px', paddingLeft: '5px', borderLeft: state.selectedViewNode === nodeId ? '1px solid #53B2ED' : '1px solid white'}}, [
                                ...node.childrenIds.map((id)=> listNodes(id, nodeId)),
                                h('span', {style: {display: state.selectedViewNode === nodeId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid white', padding: '5px', margin: '5px'}, on: {click: [ADD_NODE, nodeId, 'box']}}, '+ box'),
                                h('span', {style: {display: state.selectedViewNode === nodeId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid white', padding: '5px', margin: '5px'}, on: {click: [ADD_NODE, nodeId, 'text']}}, '+ text'),
                                h('span', {style: {display: state.selectedViewNode === nodeId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid white', padding: '5px', margin: '5px'}, on: {click: [ADD_NODE, nodeId, 'input']}}, '+ input'),
                            ]),
                            h('div', {style: {display: state.selectedViewNode === nodeId ? 'block': 'none', position: 'absolute', right: '5px', top: '0'}, on: {click: [DELETE_SELECTED_VIEW, nodeId, parentId]}}, 'x'),
                        ]
                    )
                } else {
                    return h('div', {
                            style: {
                                paddingLeft: '5px',
                                cursor: 'pointer',
                                position: 'relative'
                            },
                            on: {click: [VIEW_NODE_SELECTED, nodeId]}
                        }, [
                            state.selectedViewNode === nodeId ? h('span', {style: {color: '#53B2ED'}}, node.nodeType) : node.nodeType,
                            h('div', {style: {display: state.selectedViewNode === nodeId ? 'block': 'none', position: 'absolute', right: '5px', top: '0'}, on: {click: [DELETE_SELECTED_VIEW, nodeId, parentId]}}, 'x')
                        ]
                    )
                }
            }
        }
        function generateEditNodeComponent() {
            const styles = ['background', 'border', 'outline', 'cursor', 'color', 'display', 'top', 'bottom', 'left', 'right', 'position', 'overflow', 'height', 'width', 'font', 'font', 'margin', 'padding', 'userSelect']
            const selectedNode = state.definition.nodes[state.selectedViewNode]
            const selectedStyle = state.definition.styles[selectedNode.styleId]
            const styleEditorComponent = h('div', {style: {}},
                Object.keys(selectedStyle).map((key)=>h('div', [h('span', key), h('input', {props: {value: selectedStyle[key]}, on: {input: [CHANGE_STYLE, selectedNode.styleId, key]}})]))
            )
            const addStyleComponent = h('div', {style: {}},
                styles.filter((key)=>!Object.keys(selectedStyle).includes(key)).map((key)=>h('div', {on: {click: [ADD_DEFAULT_STYLE, selectedNode.styleId, key]},style:{display: 'inline-block', cursor: 'pointer', borderRadius: '5px', border: '3px solid white', padding: '5px', margin: '5px'}}, '+ ' + key))
            )
            return h('div', {
                style: {
                    position: 'absolute',
                    left: '-373px',
                    top: '-3px',
                    height: '97%',
                    borderRadius: '10px',
                    width: '350px',
                    background: '#4d4d4d',
                    border: '3px solid #333333',
                    padding: '5px',
                }
            }, [
                styleEditorComponent,
                addStyleComponent
            ])
        }

        const viewComponent = h('div', {
            style: {
                position: 'relative',
                flex: '1',
                borderTop: '3px solid #333333',
                padding: '5px',
            }
        }, [listNodes('_rootNode'), state.definition.nodes[state.selectedViewNode] ? generateEditNodeComponent(): h('span')])

        const vnode =
            h('div', {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    color: '#dddddd',
                    font: "300 1.5em 'Helvetica Neue', Helvetica, Arial, sans-serif",
                    position: 'fixed',
                    top: '0',
                    right: '0',
                    width: '350px',
                    height: '100vh',
                    background: '#4d4d4d',
                    boxSizing: "border-box",
                    borderLeft: '3px solid #333333',
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