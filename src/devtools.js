import snabbdom from 'snabbdom'
const patch = snabbdom.init([
    require('snabbdom/modules/props'), // for setting properties on DOM elements
    require('snabbdom/modules/style'), // handles styling on elements with support for animations
    require('snabbdom/modules/eventlisteners'), // attaches event listeners
]);

export default function init(definitions, currentState, renderApp){
    let node = document.createElement('div')
    document.body.appendChild(node)
    
    const state = {
        isOpen: true,
        currentState,
        selectedComponent: definitions.view
    }
    
    function openMenu(){
        state.isOpen = !state.isOpen
        render();
    }
    function selectComponent(compoenent, e){
        e.stopImmediatePropagation()
        state.selectedComponent = compoenent
        render();
    }
    function generateChildTree(component){
        return [
            {
                sel: 'div',
                data: {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                    },
                },
                children: [
                    {
                        sel: 'div',
                        data: {
                            style: {
                                padding: '15px 38px',
                                fontSize: '2.5em',
                                backgroundColor: '#4d4d4d',
                                margin: '5px',
                                borderRadius: '5px',
                            },
                        },
                        text: component.nodeType,
                    }
                ],
            },
            {
                sel: 'div',
                data: {
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    },
                },
                children: component.children && component.children.value.map((child)=>{
                    return {
                        sel: 'div',
                        data: {
                            style: {
                                padding: '10px 30px',
                                fontSize: '2em',
                                backgroundColor: '#4d4d4d',
                                margin: '5px',
                                borderRadius: '5px',
                                boxShadow: state.selectedComponent === child ? '0 0 5px #ffffff': undefined,
                            },
                            on: {
                                click: [selectComponent, child]
                            }
                        },
                        text: child.nodeType,
                    }
                }),
            }
        ]
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
            },
            children: [
                {
                    sel: 'div',
                    data: {
                        style: {
                            position: 'absolute',
                            transform: 'rotate(180deg)',
                            writingMode: 'vertical-lr',
                            right: state.isOpen ? '700px' : '0px',
                            padding: '15px 5px 15px 5px',
                            borderRadius: '0px 5px 5px 0px',
                            top: '40px',
                            fontSize: '2em',
                            background: '#4d4d4d',
                            color: '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.5s',
                            zIndex: '1000',
                        },
                        on: {
                            click: openMenu
                        }
                    },
                    text: state.isOpen ? 'Close devtools' : 'Open devtools',
                },
                {
                    sel: 'div',
                    data: {
                        style: {
                            boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 25px 50px 0 rgba(0, 0, 0, 0.1)',
                            position: 'absolute',
                            right: state.isOpen ? '0px' : '-700px',
                            backgroundSize: '16px',
                            backgroundImage: 'url(/images/blueprint.png)',
                            color: '#ffffff',
                            boxSizing: 'border-box',
                            borderLeft: '6px solid #4d4d4d',
                            width: '700px',
                            height: '100vh',
                            top: '0',
                            transition: 'all 0.5s',
                            overflow: 'hidden',
                        },
                    },
                    children: [
                        {
                            sel: 'div',
                            data: {
                                style: {
                                    padding: '10px',
                                    display: 'flex',
                                    height: '50%',
                                    width: '100%',
                                    alignItems: 'center',
                                    overflow: 'scroll',
                                },
                            },
                            children: generateChildTree(definitions.view)
                        },
                        // component and state
                        {
                            sel: 'div',
                            data: {
                                style: {
                                    display: 'flex',
                                    marginTop: '50px',
                                    backgroundColor: '#f5f5f5',
                                    borderTop: '6px solid #4d4d4d',
                                    height: '50%',
                                    width: '100%',
                                    color: '#000000',
                                    position: 'absolute',
                                    bottom: '0',
                                    left: '0',
                                },
                            },
                            children: [
                                {
                                    sel: 'div',
                                    data: {
                                        style: {
                                            flex: '1',
                                            padding: '10px',
                                            borderRight: '6px solid #4d4d4d',
                                        },
                                    },
                                    text: 'Selected Component: ' + state.selectedComponent.nodeType
                                },
                                {
                                    sel: 'div',
                                    data: {
                                        style: {
                                            flex: '1',
                                            padding: '10px',
                                        },
                                    },
                                    children: Object.keys(definitions.state).map(stateName =>
                                        ({
                                            sel: 'div',
                                            data: {
                                                style: {
                                                    flex: '1',
                                                    padding: '10px',
                                                    fontSize: '1.5em',
                                                },
                                            },
                                            key: stateName,
                                            text: `${stateName} \\${definitions.state[stateName].stateType}\\: Default: ${definitions.state[stateName].defaultValue} Current: ${state.currentState[stateName]} `
                                        })
                                    ),
                                }
                            ],
                        },
                    ]
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
    
    return function emit(action, event, newState, mutations){
        state.currentState = newState;
        render()
    }
}