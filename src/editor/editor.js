function updateProps(oldVnode, vnode) {
    var key, cur, old, elm = vnode.elm,
        props = vnode.data.liveProps || {};
    for (key in props) {
        cur = props[key];
        old = elm[key];
        if (old !== cur) elm[key] = cur;
    }
}
const livePropsPlugin = {create: updateProps, update: updateProps};
import snabbdom from 'snabbdom'
const patch = snabbdom.init([
    require('snabbdom/modules/class'),
    require('snabbdom/modules/props'),
    require('snabbdom/modules/style'),
    require('snabbdom/modules/eventlisteners'),
    require('snabbdom/modules/attributes'),
    livePropsPlugin
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
        selectedViewSubMenu: 'props',
        editingTitleNodeId: '',
        activeEvent: '',
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
    document.addEventListener('click', (e)=> {
        // clicked outside
        if(state.editingTitleNodeId && !e.target.dataset.istitleeditor){
            setState({...state, editingTitleNodeId: ''})
        }
    })
    document.addEventListener('keydown', (e)=>{
        // 83 - s
        // 90 - z
        // 89 - y
        // 13 - enter
        if(e.which == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            e.preventDefault();
            fetch('/save', {method: 'POST', body: JSON.stringify(state.definition), headers: {"Content-Type": "application/json"}})
            return false;
        }
        if(e.which == 90 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            e.preventDefault();
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
            e.preventDefault();
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
        if(e.which == 13) {
            setState({...state, editingTitleNodeId: ''})
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
        const newStyle = {
            padding: '10px',
        }
        if(type === 'box' || type === 'text') {
            const newNode = type === 'box' ? {
                    _type: 'vNode',
                    title: type,
                    nodeType: type,
                    styleId: newStyleId,
                    childrenIds: []
                } : {
                    _type: 'vNode',
                    title: type,
                    nodeType: type,
                    styleId: newStyleId,
                    value: 'Default Text'
                }
            setState({...state, definition: {
                ...state.definition,
                nodes: {...state.definition.nodes, [nodeId]: {...state.definition.nodes[nodeId], childrenIds: state.definition.nodes[nodeId].childrenIds.concat(newNodeId)}, [newNodeId]: newNode},
                styles: {...state.definition.styles, [newStyleId]: newStyle},
            }}, true)
        }
        if(type === 'input') {
            const newStateId = uuid.v4()
            const eventId = uuid.v4()
            const mutatorId = uuid.v4()
            const newNode = {
                _type: 'vNode',
                title: type,
                nodeType: type,
                styleId: newStyleId,
                value: {
                    _type: 'state',
                    value: newStateId
                },
                onInput: {
                    eventName: eventId
                }
            }
            const newState = {
                title: 'input value',
                stateType: 'string',
                defaultValue: 'Default string',
                mutators: {
                    [eventId]: mutatorId
                },
            }
            const setToEventMutator = {
                _type: 'eventValue'
            }
            const event = {
                title: 'update input',
                states: [newStateId]
            }
            // also add state
            return setState({...state, definition: {
                ...state.definition,
                nodes: {...state.definition.nodes, [nodeId]: {...state.definition.nodes[nodeId], childrenIds: state.definition.nodes[nodeId].childrenIds.concat(newNodeId)}, [newNodeId]: newNode},
                styles: {...state.definition.styles, [newStyleId]: newStyle},
                state: {...state.definition.state, ['_rootState']: {...state.definition.state['_rootState'], childrenIds: state.definition.state['_rootState'].childrenIds.concat(newStateId)}, [newStateId]: newState},
                mutators: {...state.definition.mutators, [mutatorId]: setToEventMutator},
                events: {...state.definition.events, [eventId]: event},
            }}, true)
        }
    }
    function ADD_STATE(namespaceId, type) {
        const newStateId = uuid.v4()
        let newState
        if(type === 'string') {
            newState = {
                title: 'new string',
                stateType: 'string',
                defaultValue: 'Default string',
                mutators: {},
            }
        }
        if(type === 'number') {
            newState = {
                title: 'new number',
                stateType: 'number',
                defaultValue: 0,
                mutators: {},
            }
        }
        if(type === 'boolean') {
            newState = {
                title: 'new boolean',
                stateType: 'boolean',
                defaultValue: true,
                mutators: {},
            }
        }
        if(type === 'table') {
            newState = {
                title: 'new table',
                stateType: 'table',
                defaultValue: {},
                mutators: {},
            }
        }
        if(type === 'namespace') {
            newState = {
                title: 'new namespace',
                stateType: 'nameSpace',
                childrenIds: [],
            }
        }
        setState({...state, definition: {
            ...state.definition,
            state: {...state.definition.state, [namespaceId]: {...state.definition.state[namespaceId], childrenIds: state.definition.state[namespaceId].childrenIds.concat(newStateId)}, [newStateId]: newState},
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
    function SELECT_VIEW_SUBMENU(newId) {
        setState({...state, selectedViewSubMenu:newId})
    }
    function EDIT_VIEW_NODE_TITLE(nodeId) {
        setState({...state, editingTitleNodeId:nodeId})
    }
    function CHANGE_VIEW_NODE_TITLE(nodeId, e) {
        e.preventDefault();
        setState({...state, definition: {
            ...state.definition,
            nodes: {...state.definition.nodes, [nodeId]: {...state.definition.nodes[nodeId], title: e.target.value}},
        }}, true)
    }
    function CHANGE_STATE_NODE_TITLE(nodeId, e) {
        e.preventDefault();
        setState({...state, definition: {
            ...state.definition,
            state: {...state.definition.state, [nodeId]: {...state.definition.state[nodeId], title: e.target.value}},
        }}, true)
    }

    // Listen to app and blink every action
    let timer = null
    app.addListener((eventName, data, e, previousState, currentState, mutations)=>{
        setState({...state, activeEvent: eventName})
        // yeah, I probably needed some observables too
        if(timer){
            clearTimeout(timer)
        }
        timer = setTimeout(()=> {
            setState({...state, activeEvent: ''})
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
            function editingNode(hasBorder) {
                return h('input', {
                    style: {
                        background: 'none',
                        color: state.selectedStateNode === stateId ? '#eab65c': 'white',
                        outline: 'none',
                        boxShadow: hasBorder ? 'none': 'inset 0 -1px 0 0 white',
                        padding: hasBorder ? '2px 5px': '0',
                        margin: hasBorder ? '3px 3px 0 0' : '0',
                        border: hasBorder ? '2px solid ' + (state.selectedStateNode === stateId ? '#eab65c': 'white'): 'none',
                        borderRadius: hasBorder ? '10px': '0',
                        display: 'inline'
                    },
                    on: {
                        input: [CHANGE_STATE_NODE_TITLE, stateId],
                    },
                    liveProps: {
                        value: currentState.title,
                    },
                    attrs: {
                        autofocus: true,
                        'data-istitleeditor': true
                    }
                })
            }
            if(currentState.stateType === 'nameSpace') {
                // if empty and unselected consider closed
                const closed = state.viewFoldersClosed[stateId] || (state.selectedStateNode !== stateId && currentState.childrenIds.length === 0)
                return h('div', {
                        style: {
                            position: 'relative',
                        }
                    }, [
                        h('div', {style: { padding: '3px'}}, [
                            h('svg', {
                                attrs: {width: 12, height: 16},
                                style: { cursor: 'pointer', padding: '0 5px', transform: closed ? 'rotate(0deg)': 'rotate(90deg)'},
                                on: {
                                    click: [VIEW_FOLDER_CLICKED, stateId]
                                },
                            },
                            [h('polygon', {attrs: {points: '12,8 0,1 3,8 0,15', fill:  state.selectedStateNode === stateId ? '#eab65c': 'white'}})]),
                            state.editingTitleNodeId === stateId ?
                                editingNode():
                                h('span', { style: { cursor: 'pointer'}, on: {click: [STATE_NODE_SELECTED, stateId], dblclick: [EDIT_VIEW_NODE_TITLE, stateId]}}, state.selectedStateNode === stateId ? [h('span', {style: {color: '#eab65c'}}, currentState.title)] : currentState.title),
                        ]),
                        h('div', {style: { display: closed ? 'none': 'block', marginLeft: '13px', paddingLeft: '5px', paddingBottom: '5px', borderLeft: state.selectedStateNode === stateId ? '1px solid #eab65c' :'1px solid white'}}, [
                            ...currentState.childrenIds.map((id)=> listState(id, stateId)),
                            h('span', {style: {display: state.selectedStateNode === stateId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #eab65c', padding: '5px', margin: '5px'}, on: {click: [ADD_STATE, stateId, 'string']}}, '+ string'),
                            h('span', {style: {display: state.selectedStateNode === stateId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #eab65c', padding: '5px', margin: '5px'}, on: {click: [ADD_STATE, stateId, 'number']}}, '+ number'),
                            h('span', {style: {display: state.selectedStateNode === stateId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #eab65c', padding: '5px', margin: '5px'}, on: {click: [ADD_STATE, stateId, 'boolean']}}, '+ boolean'),
                            h('span', {style: {display: state.selectedStateNode === stateId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #eab65c', padding: '5px', margin: '5px'}, on: {click: [ADD_STATE, stateId, 'table']}}, '+ table'),
                            h('span', {style: {display: state.selectedStateNode === stateId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #eab65c', padding: '5px', margin: '5px'}, on: {click: [ADD_STATE, stateId, 'namespace']}}, '+ namespace'),
                        ]),
                    ]
                )
            }
            return h('div', {
                    style: {
                        paddingLeft: '5px',
                        cursor: 'pointer',
                        position: 'relative',
                        fontSize: '0.8em',
                    },
                },
                [
                    h('span', {on: {click: [STATE_NODE_SELECTED, stateId], dblclick: [EDIT_VIEW_NODE_TITLE, stateId]}}, [
                        state.editingTitleNodeId === stateId ?
                            editingNode(true):
                            h('span', {style: {color: state.selectedStateNode === stateId ? '#eab65c': 'white', padding: '2px 5px', margin: '3px 3px 0 0', border: '2px solid ' + (state.selectedStateNode === stateId ? '#eab65c': 'white'), borderRadius: '10px', display: 'inline-block'}}, currentState.title),
                        h('span', ': '),
                        h('span', {style: {color: app.getCurrentState()[stateId] !== state.definition.state[stateId].defaultValue ? 'rgb(91, 204, 91)': 'white'}}, app.getCurrentState()[stateId]),
                    ]),
                    ...Object.keys(currentState.mutators).map(key =>
                        h('div', {style: {display: 'box', padding: '2px 0 0 15px'}}, [
                            h('span', {style: {color: state.activeEvent === key ? 'rgb(91, 204, 91)': 'white', transition: 'all 0.2s'}}, state.definition.events[key].title)
                        ])
                    )
                ]
            )
        }
        const stateComponent = h('div', {
            style: {
                overflow: 'overlay',
                flex: '1',
            }
        }, [listState('_rootState')])
        function listNodes(nodeId, parentId) {
            const node = state.definition.nodes[nodeId]
            function editingNode() {
                return h('input', {
                    style: {
                        border: 'none',
                        background: 'none',
                        color: state.selectedViewNode === nodeId ? '#53B2ED': 'white',
                        outline: 'none',
                        padding: '0',
                        boxShadow: 'inset 0 -1px 0 0 white',
                    },
                    on: {
                        input: [CHANGE_VIEW_NODE_TITLE, nodeId],
                    },
                    liveProps: {
                        value: node.title,
                    },
                    attrs: {
                        autofocus: true,
                        'data-istitleeditor': true
                    }
                })
            }
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
                            state.editingTitleNodeId === nodeId ?
                                editingNode():
                                h('span', { style: {cursor: 'pointer', color: state.selectedViewNode === nodeId ? '#53B2ED': 'white'}, on: {click: [VIEW_NODE_SELECTED, nodeId], dblclick: [EDIT_VIEW_NODE_TITLE, nodeId]}}, node.title),
                           h('div', {style: { display: closed ? 'none': 'block', marginLeft: '10px', paddingLeft: '10px', borderLeft: state.selectedViewNode === nodeId ? '1px solid #53B2ED' : '1px solid white'}}, [
                                ...node.childrenIds.map((id)=> listNodes(id, nodeId)),
                                h('span', {style: {display: state.selectedViewNode === nodeId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #53B2ED', padding: '5px', margin: '5px'}, on: {click: [ADD_NODE, nodeId, 'box']}}, '+ box'),
                                h('span', {style: {display: state.selectedViewNode === nodeId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #53B2ED', padding: '5px', margin: '5px'}, on: {click: [ADD_NODE, nodeId, 'text']}}, '+ text'),
                                h('span', {style: {display: state.selectedViewNode === nodeId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #53B2ED', padding: '5px', margin: '5px'}, on: {click: [ADD_NODE, nodeId, 'input']}}, '+ input'),
                            ]),
                            h('div', {style: {display: state.selectedViewNode === nodeId ? 'block': 'none', position: 'absolute', right: '5px', top: '0'}, on: {click: [DELETE_SELECTED_VIEW, nodeId, parentId]}}, 'x'),
                        ]
                    )
                } else if(state.editingTitleNodeId === nodeId) {
                    return editingNode()
                } else {
                    return h('div', {
                            style: {
                                cursor: 'pointer',
                                position: 'relative'
                            },
                            on: {
                                click: [VIEW_NODE_SELECTED, nodeId],
                                dblclick: [EDIT_VIEW_NODE_TITLE, nodeId]
                            }
                        }, [
                            h('span', {style: {color: state.selectedViewNode === nodeId ? '#53B2ED': 'white'}}, node.title),
                            h('div', {style: {display: state.selectedViewNode === nodeId ? 'block': 'none', position: 'absolute', right: '5px', top: '0'}, on: {click: [DELETE_SELECTED_VIEW, nodeId, parentId]}}, 'x')
                        ]
                    )
                }
            }
        }

        const propsComponent = h('div', {
            style: {
                background: state.selectedViewSubMenu === 'props' ? '#4d4d4d': '#3d3d3d',
                padding: '15px 17px 5px',
                position: 'absolute',
                top: '0',
                left: '6px',
                zIndex: state.selectedViewSubMenu === 'props' ? '500': '0',
                cursor: 'pointer',
                borderRadius: '15px 15px 0 0',
                borderColor: '#333333',
                borderStyle: 'solid',
                borderWidth: '3px 3px 0 3px',
            },
            on: {
                click: [SELECT_VIEW_SUBMENU, 'props']
            }
        }, 'props')
        const styleComponent = h('div', {
            style: {
                background: state.selectedViewSubMenu === 'style' ? '#4d4d4d': '#3d3d3d',
                padding: '15px 17px 5px',
                position: 'absolute',
                top: '0',
                left: '94px',
                zIndex: state.selectedViewSubMenu === 'style' ? '500': '0',
                cursor: 'pointer',
                borderRadius: '15px 15px 0 0',
                borderColor: '#333333',
                borderStyle: 'solid',
                borderWidth: '3px 3px 0 3px',
            },
            on: {
                click: [SELECT_VIEW_SUBMENU, 'style']
            }
        }, 'style')
        const eventsComponent = h('div', {
            style: {
                background: state.selectedViewSubMenu === 'events' ? '#4d4d4d': '#3d3d3d',
                padding: '15px 17px 5px',
                position: 'absolute',
                top: '0',
                left: '172px',
                zIndex: state.selectedViewSubMenu === 'events' ? '500': '0',
                cursor: 'pointer',
                borderRadius: '15px 15px 0 0',
                borderColor: '#333333',
                borderStyle: 'solid',
                borderWidth: '3px 3px 0 3px',
            },
            on: {
                click: [SELECT_VIEW_SUBMENU, 'events']
            }
        }, 'events')

        const unselectComponent = h('div', {
            style: {
                background: '#4d4d4d',
                padding: '15px 23px 5px',
                position: 'absolute',
                top: '0',
                left: '296px',
                zIndex: '100',
                cursor: 'pointer',
                borderRadius: '15px 15px 0 0',
                borderColor: '#333333',
                borderStyle: 'solid',
                borderWidth: '3px 3px 0 3px',
            },
            on: {
                click: [VIEW_NODE_SELECTED, '']
            }
        }, 'x')

        function generateEditNodeComponent() {
            const styles = ['background', 'border', 'outline', 'cursor', 'color', 'display', 'top', 'bottom', 'left', 'right', 'position', 'overflow', 'height', 'width', 'font', 'font', 'margin', 'padding', 'userSelect']
            const selectedNode = state.definition.nodes[state.selectedViewNode]
            const selectedStyle = state.definition.styles[selectedNode.styleId]
            const styleEditorComponent = h('div', {style: {}},
                Object.keys(selectedStyle).map((key)=>h('div', [h('span', key), h('input', {props: {value: selectedStyle[key]}, on: {input: [CHANGE_STYLE, selectedNode.styleId, key]}})]))
            )
            const addStyleComponent = h('div', {style: {}},
                styles
                    .filter((key)=>!Object.keys(selectedStyle).includes(key))
                    .map((key)=>h('div', {on: {click: [ADD_DEFAULT_STYLE, selectedNode.styleId, key]},style:{display: 'inline-block', cursor: 'pointer', borderRadius: '5px', border: '3px solid white', padding: '5px', margin: '5px'}}, '+ ' + key))
            )
            function generatePropsMenu() {
                if(selectedNode.nodeType === 'box'){
                    return h('div', {style: {textAlign: 'center', marginTop: '100px', color: '#bdbdbd' }}, 'Component has no props')
                }
                if(selectedNode.nodeType === 'text'){
                    return h('div', 'text')
                }
                if(selectedNode.nodeType === 'input'){
                    return h('div', 'value')
                }
            }
            const propsSubmenuComponent = h('div', [generatePropsMenu()])
            const styleSubmenuComponent = h('div', [styleEditorComponent, addStyleComponent])
            const eventsSubmenuComponent = h('div', 'events')
            return h('div', {
                style: {
                    position: 'absolute',
                    left: '-373px',
                    top: '-3px',
                    height: 'calc(100% - 65px)',
                }
            }, [
                eventsComponent, styleComponent, propsComponent, unselectComponent,
                h('div', { style: {position: 'absolute', top: '48px', left: '0', background: '#4d4d4d', height: '100%', borderRadius: '10px', width: '350px', padding: '5px', border: '3px solid #333333'}},[
                    state.selectedViewSubMenu === 'props' ? propsSubmenuComponent: 
                    state.selectedViewSubMenu === 'style' ? styleSubmenuComponent:
                    state.selectedViewSubMenu === 'events' ? eventsSubmenuComponent:
                        h('span', 'Error, no such menu')
                ])
            ])
        }

        const viewComponent = h('div', {
            style: {
                position: 'relative',
                flex: '1',
                borderTop: '3px solid #333333',
                padding: '5px',
            }
        }, [
            listNodes('_rootNode'),
            state.definition.nodes[state.selectedViewNode] ? generateEditNodeComponent(): h('span')
        ])

        const vnode =
            h('div', {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    color: 'white',
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
                    userSelect: 'none',
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