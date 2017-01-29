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
        selectedViewNode: {},
        selectedStateNodeId: '',
        selectedViewSubMenu: 'props',
        editingTitleNode: {},
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
            // TODO add garbage collection?
            app.render(newState.definition)
        }
        state = newState
        render()
    }
    document.addEventListener('click', (e)=> {
        // clicked outside
        if(state.editingTitleNode._type && !e.target.dataset.istitleeditor){
            setState({...state, editingTitleNode: {}})
        }
    })
    document.addEventListener('keydown', (e)=>{
        // 83 - s
        // 90 - z
        // 89 - y
        // 13 - enter
        if(e.which == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            // TODO garbage collect
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
            setState({...state, editingTitleNode: {}})
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
    function VIEW_NODE_SELECTED(node) {
        setState({...state, selectedViewNode:node})
    }
    function UNSELECT_VIEW_NODE(e) {
        if(e.target === this.elm){
            setState({...state, selectedViewNode:{}})
        }
    }
    function STATE_NODE_SELECTED(nodeId) {
        setState({...state, selectedStateNodeId:nodeId})
    }
    function UNSELECT_STATE_NODE(e) {
        if(e.target === this.elm){
            setState({...state, selectedStateNodeId:''})
        }
    }
    function DELETE_SELECTED_VIEW(nodeId, parentId, e) {
        e.stopPropagation()
        if(nodeId === '_rootNode'){
            // immutably remove all nodes except rootNode
            return setState({...state, definition: {
                ...state.definition,
                vNodeBox: {'_rootNode': {...state.definition.vNodeBox['_rootNode'], children: []}},
            }, selectedViewNode: {}}, true)
        }
        setState({...state, definition: {
            ...state.definition,
            vNodeBox: {...state.definition.vNodeBox, [parentId]: {...state.definition.vNodeBox[parentId], children:state.definition.vNodeBox[parentId].children.filter((ref)=>ref.id !== nodeId)}},
        }, selectedViewNode: {}}, true)
    }
    function ADD_NODE(nodeId, type) {
        const newNodeId = uuid.v4()
        const newStyleId = uuid.v4()
        const newStyle = {
            _type: 'style',
            padding: '10px',
        }
        if(type === 'box') {
            const newNode = {
                _type: 'vNodeBox',
                title: 'box',
                style: {_type:'ref', ref:'styles', id:newStyleId},
                children: [],
            }
            setState({
                ...state,
                selectedViewNode: newNode,
                definition: {
                    ...state.definition,
                    vNodeBox: {...state.definition.vNodeBox, [nodeId]: {...state.definition.vNodeBox[nodeId], children: state.definition.vNodeBox[nodeId].children.concat({_type:'ref', ref:'vNodeBox', id:newNodeId})}, [newNodeId]: newNode},
                    styles: {...state.definition.styles, [newStyleId]: newStyle},
                }}, true)
        }
        if(type === 'text'){
            const newNode = {
                _type: 'vNodeText',
                title: 'text',
                style: {_type:'ref', ref:'styles', id:newStyleId},
                value: 'Default Text'
            }
            setState({
                ...state,
                selectedViewNode: newNode,
                definition: {
                    ...state.definition,
                    vNodeBox: {...state.definition.vNodeBox, [nodeId]: {...state.definition.vNodeBox[nodeId], children: state.definition.vNodeBox[nodeId].children.concat({_type:'ref', ref:'vNodeText', id:newNodeId})}},
                    vNodeText: {...state.definition.vNodeText, [newNodeId]: newNode},
                    styles: {...state.definition.styles, [newStyleId]: newStyle},
                }}, true)
        }
        if(type === 'input') {
            const stateId = uuid.v4()
            const eventId = uuid.v4()
            const mutatorId = uuid.v4()
            const getId = uuid.v4()
            const eventValueId = uuid.v4()
            const newNode = {
                _type: 'vNodeInput',
                title: 'input',
                style: {_type:'ref', ref:'styles', id:newStyleId},
                value: {_type:'ref', ref:'get', id:getId},
                input: {_type:'ref', ref:'event', id:eventId}
            }
            const newGet = {
                _type: 'get',
                stateId: stateId
            }
            const newState = {
                title: 'input value',
                stateType: 'string',
                ref: stateId,
                defaultValue: 'Default string',
                mutators: [{_type:'ref', ref:'mutators', id:mutatorId}],
            }
            const eventValue = {
                _type: 'eventValue'
            }
            const newMutator = {
                event: { _type: 'ref', ref: 'events', id:eventId},
                state: { _type: 'ref', ref: 'state', id:stateId},
                mutation: { _type: 'ref', ref: 'eventValue', id:eventValueId},
            }
            const newEvent = {
                title: 'update input',
                mutators: [
                    { _type: 'ref', ref: 'mutators', id: mutatorId},
                ]
            }
            // also add state
            return setState({
                ...state,
                selectedViewNode: newNode,
                definition: {
                    ...state.definition,
                    get: {...state.definition.get, [getId]: newGet},
                    vNodeBox: {...state.definition.vNodeBox, [nodeId]: {...state.definition.vNodeBox[nodeId], children: state.definition.vNodeBox[nodeId].children.concat({_type:'ref', ref:'vNodeInput', id:newNodeId})}},
                    vNodeInput: {...state.definition.vNodeInput, [newNodeId]: newNode},
                    styles: {...state.definition.styles, [newStyleId]: newStyle},
                    nameSpace: {...state.definition.nameSpace, ['_rootNameSpace']: {...state.definition.nameSpace['_rootNameSpace'], children: state.definition.nameSpace['_rootNameSpace'].children.concat({_type:'ref', ref:'state', id:stateId})}},
                    state: {...state.definition.state, [stateId]: newState},
                    mutators: {...state.definition.mutators, [mutatorId]: newMutator},
                    events: {...state.definition.events, [eventId]: newEvent},
                    eventValue: {...state.definition.eventValue, [eventValueId]: eventValue}
                }}, true)
        }
    }
    function ADD_STATE(namespaceId, type) {
        const newStateId = uuid.v4()
        let newState
        if(type === 'string') {
            newState = {
                title: 'new string',
                ref: newStateId,
                stateType: 'string',
                defaultValue: 'Default string',
                mutators: [],
            }
        }
        if(type === 'number') {
            newState = {
                title: 'new number',
                ref: newStateId,
                stateType: 'number',
                defaultValue: 0,
                mutators: [],
            }
        }
        if(type === 'boolean') {
            newState = {
                title: 'new boolean',
                stateType: 'boolean',
                ref: newStateId,
                defaultValue: true,
                mutators: [],
            }
        }
        if(type === 'table') {
            newState = {
                title: 'new table',
                stateType: 'table',
                ref: newStateId,
                defaultValue: {},
                mutators: [],
            }
        }
        if(type === 'namespace') {
            newState = {
                title: 'new namespace',
                children: [],
            }
            return setState({...state, definition: {
                ...state.definition,
                nameSpace: {...state.definition.nameSpace, [namespaceId]: {...state.definition.nameSpace[namespaceId], children: state.definition.nameSpace[namespaceId].children.concat({_type:'ref', ref:'nameSpace', id:newStateId})}, [newStateId]: newState},
            }}, true)
        }
        setState({...state, definition: {
            ...state.definition,
            nameSpace: {...state.definition.nameSpace, [namespaceId]: {...state.definition.nameSpace[namespaceId], children: state.definition.nameSpace[namespaceId].children.concat({_type:'ref', ref:'state', id:newStateId})}},
            state: {...state.definition.state, [newStateId]: newState},
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
    function EDIT_VIEW_NODE_TITLE(nodeId, type) {
        setState({...state, editingTitleNode:{_type: 'ref', ref:type, id:nodeId}})
    }
    function CHANGE_VIEW_NODE_TITLE(nodeId, nodeType, e) {
        e.preventDefault();
        setState({...state, definition: {
            ...state.definition,
            [nodeType]: {...state.definition[nodeType], [nodeId]: {...state.definition[nodeType][nodeId], title: e.target.value}},
        }}, true)
    }
    function CHANGE_STATE_NODE_TITLE(nodeId, e) {
        e.preventDefault();
        setState({...state, definition: {
            ...state.definition,
            state: {...state.definition.state, [nodeId]: {...state.definition.state[nodeId], title: e.target.value}},
        }}, true)
    }
    function CHANGE_NAMESPACE_TITLE(nodeId, e) {
        e.preventDefault();
        setState({...state, definition: {
            ...state.definition,
            nameSpace: {...state.definition.nameSpace, [nodeId]: {...state.definition.nameSpace[nodeId], title: e.target.value}},
        }}, true)
    }
    function CHANGE_CURRENT_STATE_TEXT_VALUE(stateId, e) {
        app.setCurrentState({...app.getCurrentState(), [stateId]: e.target.value})
        render()
    }
    function INCREMENT_CURRENT_STATE_NUMBER_VALUE(stateId) {
        app.setCurrentState({...app.getCurrentState(), [stateId]: app.getCurrentState()[stateId]+1})
        render()
    }
    function DECREMENT_CURRENT_STATE_NUMBER_VALUE(stateId) {
        app.setCurrentState({...app.getCurrentState(), [stateId]: app.getCurrentState()[stateId]-1})
        render()
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
        function listNameSpace(stateId) {
            const currentNameSpace = state.definition.nameSpace[stateId]
            function editingNode() {
                return h('input', {
                    style: {
                        background: 'none',
                        color: state.selectedStateNodeId === stateId ? '#eab65c': 'white',
                        outline: 'none',
                        boxShadow: 'inset 0 -1px 0 0 white',
                        padding: '0',
                        margin:  '0',
                        border: 'none',
                        borderRadius: '0',
                        display: 'inline'
                    },
                    on: {
                        input: [CHANGE_NAMESPACE_TITLE, stateId],
                    },
                    liveProps: {
                        value: currentNameSpace.title,
                    },
                    attrs: {
                        autofocus: true,
                        'data-istitleeditor': true
                    }
                })
            }
            const closed = state.viewFoldersClosed[stateId] || (state.selectedStateNodeId !== stateId && currentNameSpace.children.length === 0)
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
                            [h('polygon', {attrs: {points: '12,8 0,1 3,8 0,15', fill:  state.selectedStateNodeId === stateId ? '#eab65c': 'white'}})]),
                        state.editingTitleNode.id === stateId ?
                            editingNode():
                            h('span', { style: { cursor: 'pointer'}, on: {click: [STATE_NODE_SELECTED, stateId], dblclick: [EDIT_VIEW_NODE_TITLE, stateId]}}, [h('span', {style: {color: state.selectedStateNodeId === stateId ? '#eab65c': 'white'}}, currentNameSpace.title)]),
                    ]),
                    h('div', {style: { display: closed ? 'none': 'block', marginLeft: '13px', paddingLeft: '5px', paddingBottom: '5px', borderLeft: state.selectedStateNodeId === stateId ? '1px solid #eab65c' :'1px solid white'}}, [
                        ...currentNameSpace.children.map((ref)=> ref.ref === 'state' ? listState(ref.id): listNameSpace(ref.id)),
                        h('span', {style: {display: state.selectedStateNodeId === stateId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #eab65c', padding: '5px', margin: '5px'}, on: {click: [ADD_STATE, stateId, 'string']}}, '+ text'),
                        h('span', {style: {display: state.selectedStateNodeId === stateId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #eab65c', padding: '5px', margin: '5px'}, on: {click: [ADD_STATE, stateId, 'number']}}, '+ number'),
                        //h('span', {style: {display: state.selectedStateNodeId === stateId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #eab65c', padding: '5px', margin: '5px'}, on: {click: [ADD_STATE, stateId, 'boolean']}}, '+ variant'),
                        //h('span', {style: {display: state.selectedStateNodeId === stateId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #eab65c', padding: '5px', margin: '5px'}, on: {click: [ADD_STATE, stateId, 'table']}}, '+ table'),
                        h('span', {style: {display: state.selectedStateNodeId === stateId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #eab65c', padding: '5px', margin: '5px'}, on: {click: [ADD_STATE, stateId, 'namespace']}}, '+ folder'),
                    ]),
                ]
            )
        }
        function listState(stateId) {
            const currentState = state.definition.state[stateId]
            function editingNode() {
                return h('input', {
                    style: {
                        background: 'none',
                        color: state.selectedStateNodeId === stateId ? '#eab65c': 'white',
                        outline: 'none',
                        boxShadow: 'none',
                        padding: '2px 5px',
                        margin: '3px 3px 0 0',
                        border: '2px solid ' + (state.selectedStateNodeId === stateId ? '#eab65c': 'white'),
                        borderRadius: '10px',
                        display: 'inline',
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
                        state.editingTitleNode.id === stateId ?
                            editingNode():
                            h('span', {style: {color: state.selectedStateNodeId === stateId ? '#eab65c': 'white', padding: '2px 5px', margin: '3px 3px 0 0', border: '2px solid ' + (state.selectedStateNodeId === stateId ? '#eab65c': 'white'), borderRadius: '10px', display: 'inline-block'}}, currentState.title),
                    ]),
                    h('span', ': '),
                    (()=> {
                        const noStyleInput = {
                            color: app.getCurrentState()[stateId] != state.definition.state[stateId].defaultValue ? 'rgb(91, 204, 91)' : 'white',
                            background: 'none',
                            outline: 'none',
                            boxShadow: 'none',
                            display: 'inline',
                            border: 'none',
                            maxWidth: '50%',
                        }
                        if(state.definition.state[stateId].stateType === 'string') return h('input', {attrs: {type: 'text'}, liveProps: {value: app.getCurrentState()[stateId]}, style: noStyleInput, on: {input: [CHANGE_CURRENT_STATE_TEXT_VALUE, stateId]}})
                        if(state.definition.state[stateId].stateType === 'number') return h('span', {style: {position: 'relative'}}, [
                            h('span', {style: {color: app.getCurrentState()[stateId] !== state.definition.state[stateId].defaultValue ? 'rgb(91, 204, 91)': 'white'}}, app.getCurrentState()[stateId]),
                            h('svg', {
                                    attrs: {width: 6, height: 8},
                                    style: { cursor: 'pointer', position: 'absolute', top: '0', right: '-12px', padding: '2px 2px 1px 2px', transform:'rotate(-90deg)'},
                                    on: {
                                        click: [INCREMENT_CURRENT_STATE_NUMBER_VALUE, stateId]
                                    },
                                },
                                [h('polygon', {attrs: {points: '6,4 0,0 2,4 0,8', fill: 'white'}})]),
                            h('svg', {
                                    attrs: {width: 6, height: 8},
                                    style: { cursor: 'pointer', position: 'absolute', bottom: '0', right: '-12px', padding: '1px 2px 2px 2px', transform:'rotate(90deg)'},
                                    on: {
                                        click: [DECREMENT_CURRENT_STATE_NUMBER_VALUE, stateId]
                                    },
                                },
                                [h('polygon', {attrs: {points: '6,4 0,0 2,4 0,8', fill: 'white'}})]),
                        ])
                    })(),
                    ...currentState.mutators.map(ref =>
                        h('div', {style: {display: 'box', padding: '2px 0 0 15px'}}, [
                            h('span', {style: {color: state.activeEvent === state.definition.mutators[ref.id].event.id ? 'rgb(91, 204, 91)': 'white', transition: 'all 0.2s'}}, state.definition.events[state.definition.mutators[ref.id].event.id].title)
                        ])
                    )
                ]
            )
        }
        const stateComponent = h('div', {
            style: {
                overflow: 'overlay',
                flex: '1',
            },
            on: {
                click: [UNSELECT_STATE_NODE]
            }
        }, [listNameSpace('_rootNameSpace')])
        function listBoxNode(nodeId, parentId) {
            const node = state.definition.vNodeBox[nodeId]
            function editingNode() {
                return h('input', {
                    style: {
                        border: 'none',
                        background: 'none',
                        color: state.selectedViewNode === node ? '#53B2ED': 'white',
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
                        [h('polygon', {attrs: {points: '12,8 0,1 3,8 0,15', fill:  state.selectedViewNode === node ? '#53B2ED': 'white'}})]),
                    state.editingTitleNode.id === nodeId ?
                        editingNode():
                        h('span', { style: {cursor: 'pointer', color: state.selectedViewNode === node ? '#53B2ED': 'white'}, on: {click: [VIEW_NODE_SELECTED, node], dblclick: [EDIT_VIEW_NODE_TITLE, node]}}, node.title),
                    h('div', {style: { display: closed ? 'none': 'block', marginLeft: '10px', paddingLeft: '10px', borderLeft: state.selectedViewNode === node ? '1px solid #53B2ED' : '1px solid white'}}, [
                        ...node.children.map((ref)=>{
                            if(ref.ref === 'vNodeText') return listTextNode(ref.id, nodeId)
                            if(ref.ref === 'vNodeBox') return listBoxNode(ref.id, nodeId)
                            if(ref.ref === 'vNodeInput') return listInputNode(ref.id, nodeId)
                        }),
                        h('span', {style: {display: state.selectedViewNode === node ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #53B2ED', padding: '5px', margin: '5px'}, on: {click: [ADD_NODE, nodeId, 'box']}}, '+ box'),
                        h('span', {style: {display: state.selectedViewNode === node ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #53B2ED', padding: '5px', margin: '5px'}, on: {click: [ADD_NODE, nodeId, 'text']}}, '+ text'),
                        h('span', {style: {display: state.selectedViewNode === node ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #53B2ED', padding: '5px', margin: '5px'}, on: {click: [ADD_NODE, nodeId, 'input']}}, '+ input'),
                    ]),
                    h('div', {style: {display: state.selectedViewNode === node ? 'block': 'none', position: 'absolute', right: '5px', top: '0'}, on: {click: [DELETE_SELECTED_VIEW, nodeId, parentId]}}, 'x'),
                ]
            )
        }

        function listTextNode(nodeId, parentId) {
            const node = state.definition.vNodeText[nodeId]
            function editingNode() {
                return h('input', {
                    style: {
                        border: 'none',
                        background: 'none',
                        color: state.selectedViewNode === node ? '#53B2ED': 'white',
                        outline: 'none',
                        padding: '0',
                        boxShadow: 'inset 0 -1px 0 0 white',
                    },
                    on: {
                        input: [CHANGE_VIEW_NODE_TITLE, nodeId, 'vNodeText'],
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
            if(state.editingTitleNode.id === nodeId) {
                return editingNode()
            } else {
                return h('div', {
                        style: {
                            cursor: 'pointer',
                            position: 'relative'
                        },
                        on: {
                            click: [VIEW_NODE_SELECTED, node],
                            dblclick: [EDIT_VIEW_NODE_TITLE, nodeId, 'vNodeText']
                        }
                    }, [
                        h('span', {style: {color: state.selectedViewNode === node ? '#53B2ED': 'white'}}, node.title),
                        h('div', {style: {display: state.selectedViewNode === node ? 'block': 'none', position: 'absolute', right: '5px', top: '0'}, on: {click: [DELETE_SELECTED_VIEW, nodeId, parentId]}}, 'x')
                    ]
                )
            }
        }

        function listInputNode(nodeId, parentId) {
            const node = state.definition.vNodeInput[nodeId]
            function editingNode() {
                return h('input', {
                    style: {
                        border: 'none',
                        background: 'none',
                        color: state.selectedViewNode === node ? '#53B2ED': 'white',
                        outline: 'none',
                        padding: '0',
                        boxShadow: 'inset 0 -1px 0 0 white',
                    },
                    on: {
                        input: [CHANGE_VIEW_NODE_TITLE, nodeId, 'vNodeInput'],
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
            if(state.editingTitleNode.id === nodeId) {
                return editingNode()
            } else {
                return h('div', {
                        style: {
                            cursor: 'pointer',
                            position: 'relative'
                        },
                        on: {
                            click: [VIEW_NODE_SELECTED, node],
                            dblclick: [EDIT_VIEW_NODE_TITLE, node]
                        }
                    }, [
                        h('span', {style: {color: state.selectedViewNode === node ? '#53B2ED': 'white'}}, node.title),
                        h('div', {style: {display: state.selectedViewNode === node ? 'block': 'none', position: 'absolute', right: '5px', top: '0'}, on: {click: [DELETE_SELECTED_VIEW, nodeId, parentId]}}, 'x')
                    ]
                )
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
                click: [UNSELECT_VIEW_NODE]
            }
        }, 'x')
        const listEmber = (node, expected) => {
            if(node._type === 'ref'){
                if(node.ref === 'add'){
                    const ref = state.definition[node.ref][node.id]
                    return h('span', { style: {}}, [
                        listEmber(ref.a),
                        h('span', ' + '),
                        listEmber(ref.b)
                    ])
                }
                if(node.ref === 'get'){
                    const ref = state.definition[node.ref][node.id]
                    return h('span', {
                            style: {cursor: 'pointer', color: state.selectedStateNodeId === ref.stateId ? '#eab65c': 'white', padding: '2px 5px', margin: '3px 3px 0 0', border: '2px solid ' + (state.selectedStateNodeId === ref.stateId ? '#eab65c': 'white'), borderRadius: '10px', display: 'inline-block'},
                            on: {click: [STATE_NODE_SELECTED, ref.stateId]}
                        },
                        state.definition.state[ref.stateId].title)
                }
            }
            return h('span', {style: {color: '#bdbdbd', textDecoration: 'underline'}}, String(node))
        }

        function generateEditNodeComponent() {
            const styles = ['background', 'border', 'outline', 'cursor', 'color', 'display', 'top', 'bottom', 'left', 'right', 'position', 'overflow', 'height', 'width', 'font', 'font', 'margin', 'padding', 'userSelect']
            const selectedNode = state.selectedViewNode
            const selectedStyle = state.definition.styles[selectedNode.style.id]
            const styleEditorComponent = h('div', {style: {}},
                Object.keys(selectedStyle).map((key)=>h('div', [h('input', {
                    style: {
                        border: 'none',
                        background: 'none',
                        color:  'white',
                        outline: 'none',
                        padding: '0',
                        boxShadow: 'inset 0 -1px 0 0 white',
                        display: 'inline-block',
                        width: '150px',
                        margin: '10px',
                    },
                    props: {value: selectedStyle[key]},
                    on: {input: [CHANGE_STYLE, selectedNode.style.id, key]}}),
                    h('span', key)]))
            )
            const addStyleComponent = h('div', {style: {}},
                styles
                    .filter((key)=>!Object.keys(selectedStyle).includes(key))
                    .map((key)=>h('div', {on: {click: [ADD_DEFAULT_STYLE, selectedNode.style.id, key]},style:{display: 'inline-block', cursor: 'pointer', borderRadius: '5px', border: '3px solid white', padding: '5px', margin: '5px'}}, '+ ' + key))
            )
            function generatePropsMenu() {
                if(state.selectedViewNode._type === 'vNodeBox'){
                    return h('div', {style: {textAlign: 'center', marginTop: '100px', color: '#bdbdbd' }}, 'Component has no props')
                }
                if(state.selectedViewNode._type === 'vNodeText'){
                    return h('div', {style: {padding: '10px'}}, [h('span', 'text: '), listEmber(selectedNode.value)])
                }
                if(state.selectedViewNode._type === 'vNodeInput'){
                    return h('div', [h('span', 'value: '), listEmber(selectedNode.value)])
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
            },
            on: {
                click: [UNSELECT_VIEW_NODE]
            }
        }, [
            listBoxNode('_rootNode'),
            state.selectedViewNode._type ? generateEditNodeComponent(): h('span')
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