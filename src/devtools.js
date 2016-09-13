import snabbdom from 'snabbdom'
const patch = snabbdom.init([
    require('snabbdom/modules/props'), // for setting properties on DOM elements
    require('snabbdom/modules/style'), // handles styling on elements with support for animations
    require('snabbdom/modules/eventlisteners'), // attaches event listeners
]);

const styles = [
    'width',
    'height',
    'display',
    'padding',
    'margin',
    'position',
    'top',
    'bottom',
    'left',
    'right',
    'float',
    'border',
    'background',
    'boxShadow',
    'fontSize',
    'lineHeight',
    'fontWeight',
    'textAlign',
    'writingMode',
    'color',
    'alignItems',
    'cursor',
    'overflow',
]

export default function init(definitions, currentState, renderApp) {
    let node = document.createElement('div')
    document.body.appendChild(node)
    
    const state = {
        isOpen: true,
        currentState,
        selectedComponent: definitions.view,
        highlight: true,
    }
    
    function changeHighlight() {
        state.highlight = !state.highlight
        render();
        renderApp();
    }
    
    function openMenu() {
        state.isOpen = !state.isOpen
        render();
    }
    
    function selectComponent(compoenent, e) {
        e.stopImmediatePropagation()
        state.selectedComponent = compoenent
        render();
        renderApp();
    }
    
    function generateChildTree(component) {
        if(component._type) {
            return {
                sel: 'div',
                data: {
                    style: {
                        padding: '5px 0',
                        textAlign: 'center',
                        width: '106px',
                        height: '28px',
                        fontSize: '1.5em',
                        backgroundColor: '#4d4d4d',
                        margin: '5px',
                        cursor: 'pointer',
                        borderRadius: '5px',
                    },
                },
                text: component._type
            }
        }
        return {
            sel: 'div',
            data: {
                style: {
                    display: 'flex',
                    border: '1px solid white',
                    padding: '2px',
                },
                on: {
                    click: [selectComponent, component]
                }
            },
            children: [
                {
                    sel: 'div',
                    data: {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        },
                    },
                    children: [
                        {
                            sel: 'div',
                            data: {
                                style: {
                                    padding: '10px 0',
                                    textAlign: 'center',
                                    width: '106px',
                                    height: '34px',
                                    fontSize: '2em',
                                    backgroundColor: '#4d4d4d',
                                    margin: '5px',
                                    cursor: 'pointer',
                                    borderRadius: '5px',
                                    boxShadow: state.selectedComponent === component ? '0 0 5px #ffffff' : undefined,
                                },
                            },
                            text: component.nodeType || component._type,
                        }
                    ]
                },
                {
                    sel: 'div',
                    data: {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                        },
                    },
                    children: (()=>{
                        if(!component.children) return undefined
                        if(component.children._type && component.children._type !== 'nodeArray') return [generateChildTree(component.children)]
                        return component.children && component.children.value && component.children.value.map(generateChildTree)
                    })()
                },
            ],
        }
    }
    
    function vdom() {
        return {
            sel: 'div',
            data: {
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
                            position: 'absolute',
                            display: 'flex',
                            left: '15px',
                            padding: '15px',
                            borderRadius: '5px',
                            bottom: state.isOpen ? '15px' : '-50px',
                            background: '#4d4d4d',
                            color: '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.5s',
                            zIndex: '2000',
                        },
                        on: {
                            click: changeHighlight
                        }
                    },
                    children: [
                        {
                            sel: 'input',
                            data: {
                                props: {
                                    type: 'checkbox',
                                    checked: state.highlight
                                },
                                style: {
                                    display: 'inline-block'
                                },
                            },
                        },
                        {
                            sel: 'span',
                            data: {
                                style: {
                                    userSelect: 'none',
                                    whiteSpace: 'nowrap',
                        
                                },
                            },
                            text: 'Highlight live component'
                        },
                    ]
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
                                    height: '50%',
                                    overflow: 'scroll',
                                },
                            },
                            children: [generateChildTree(definitions.view)]
                        },
                        // component and state
                        {
                            sel: 'div',
                            data: {
                                style: {
                                    display: 'flex',
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
                                            overflow: 'scroll',
                                            padding: '10px',
                                            borderRight: '6px solid #4d4d4d',
                                        },
                                    },
                                    children: [
                                        state.selectedComponent.nodeType === 'text' ? {
                                            sel: 'div',
                                            data: {
                                                style: {
                                                    width: '100%',
                                                },
                                            },
                                            children: [
                                                {
                                                    sel: 'div',
                                                    data: {
                                                        style: {
                                                            display: 'inline-block',
                                                            width: '30%',
                                                            textAlign: 'right',
                                                        },
                                                    },
                                                    text: 'Text: '
                                                },
                                                {
                                                    sel: 'input',
                                                    data: {
                                                        props: {
                                                            value: state.selectedComponent.value || ''
                                                        },
                                                        style: {
                                                            display: 'inline-block',
                                                        },
                                                        on: {
                                                            input: (e)=> {
                                                                state.selectedComponent.value = e.target.value;
                                                                renderApp()
                                                            }
                                                        }
                                                    },
                                                }
                                            ]
                                        }:
                                        {
                                            sel: 'div',
                                            data: {
                                                style: {
                                                    width: '100%',
                                                },
                                            },
                                            children: [
                                                {
                                                    sel: 'div',
                                                    data: {
                                                        style: {
                                                            display: 'inline-block',
                                                            width: '30%',
                                                            textAlign: 'right',
                                                        },
                                                    },
                                                    text: 'Children:'
                                                },
                                            ]
                                        }
                                    ].concat(styles.map((name)=>(
                                        {
                                            sel: 'div',
                                            data: {
                                                style: {
                                                    width: '100%',
                                                },
                                            },
                                            children: [
                                                {
                                                    sel: 'div',
                                                    data: {
                                                        style: {
                                                            display: 'inline-block',
                                                            width: '30%',
                                                            textAlign: 'right',
                                                        },
                                                    },
                                                    text: name + ': '
                                                },
                                                {
                                                    sel: 'input',
                                                    data: {
                                                        props: {
                                                            value: state.selectedComponent.style[name] || ''
                                                        },
                                                        style: {
                                                            display: 'inline-block',
                                                        },
                                                        on: {
                                                            input: (e)=> {
                                                                state.selectedComponent.style = Object.assign({}, state.selectedComponent.style, {[name]: e.target.value});
                                                                renderApp()
                                                            }
                                                        }
                                                    },
                                                }
                                            ]
                                        }))
                                    ),
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
    
    function render() {
        const newDom = vdom()
        patch(node, newDom)
        node = newDom
    }
    
    render()
    
    return {
        state: state,
        emit: function (action, event, newState, mutations) {
            state.currentState = newState;
            render()
        }
    }
}