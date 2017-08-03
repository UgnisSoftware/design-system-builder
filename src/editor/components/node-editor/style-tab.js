import h from 'snabbdom/h'
import {state} from '../../state'
import {
    arrowIcon
} from '../icons'
import emberEditor from '../ember'

export default () => {
    const selectedNode = state.definitionList[state.currentDefinitionId][state.selectedViewNode.ref][state.selectedViewNode.id]
    const selectedStyle = state.definitionList[state.currentDefinitionId].style[selectedNode.style.id]
    return h(
        'div',
        {
            attrs: {class: 'better-scrollbar'},
            style: {overflow: 'auto'},
        },
        [
            h(
                'div',
                {
                    style: {
                        padding: '10px 15px 5px',
                        borderBottom: '2px solid #888',
                        letterSpacing: '1px',
                        cursor: 'pointer',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                    },
                    on: {
                        //click: [SELECT_VIEW_SUBMENU, 'events']
                    },
                },
                [arrowIcon(), 'Layout']
            ),
            h(
                'div',
                {
                    style: {},
                },
                [
                    h(
                        'div',
                        {
                            style: {
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            },
                        },
                        'Flex'
                    ),
                    h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['flex'], 'text')]),
                    h(
                        'div',
                        {
                            style: {
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            },
                        },
                        'Height'
                    ),
                    h(
                        'div',
                        {
                            style: {
                                padding: '0px 20px',
                                display: 'flex',
                                justifyContent: 'space-between',
                            },
                        },
                        [emberEditor(selectedStyle['height'], 'text'), emberEditor(selectedStyle['minHeight'], 'text'), emberEditor(selectedStyle['maxHeight'], 'text')]
                    ),
                    h(
                        'div',
                        {
                            style: {
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            },
                        },
                        'Width Min Max'
                    ),
                    h(
                        'div',
                        {
                            style: {
                                padding: '0px 20px',
                                display: 'flex',
                                justifyContent: 'space-between',
                            },
                        },
                        [emberEditor(selectedStyle['width'], 'text'), emberEditor(selectedStyle['minWidth'], 'text'), emberEditor(selectedStyle['maxWidth'], 'text')]
                    ),
                    h(
                        'div',
                        {
                            style: {
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            },
                        },
                        'Margin'
                    ),
                    h(
                        'div',
                        {
                            style: {
                                padding: '0px 20px',
                                display: 'flex',
                                justifyContent: 'space-between',
                            },
                        },
                        [emberEditor(selectedStyle['marginTop'], 'text'), emberEditor(selectedStyle['marginRight'], 'text'), emberEditor(selectedStyle['marginBottom'], 'text'), emberEditor(selectedStyle['marginLeft'], 'text')]
                    ),
                    h(
                        'div',
                        {
                            style: {
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            },
                        },
                        'Padding'
                    ),
                    h(
                        'div',
                        {
                            style: {
                                padding: '0px 20px',
                                display: 'flex',
                                justifyContent: 'space-between',
                            },
                        },
                        [
                            emberEditor(selectedStyle['paddingTop'], 'text'),
                            emberEditor(selectedStyle['paddingRight'], 'text'),
                            emberEditor(selectedStyle['paddingBottom'], 'text'),
                            emberEditor(selectedStyle['paddingLeft'], 'text'),
                        ]
                    ),
                    h(
                        'div',
                        {
                            style: {
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            },
                        },
                        'Position'
                    ),
                    h(
                        'div',
                        {
                            style: {
                                padding: '0px 20px',
                                display: 'flex',
                                justifyContent: 'space-between',
                            },
                        },
                        [emberEditor(selectedStyle['position'], 'text')]
                    ),
                    h(
                        'div',
                        {
                            style: {
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            },
                        },
                        'Top Right Bottom Left'
                    ),
                    h(
                        'div',
                        {
                            style: {
                                padding: '0px 20px',
                                display: 'flex',
                                justifyContent: 'space-between',
                            },
                        },
                        [emberEditor(selectedStyle['top'], 'text'), emberEditor(selectedStyle['right'], 'text'), emberEditor(selectedStyle['bottom'], 'text'), emberEditor(selectedStyle['left'], 'text')]
                    ),
                ]
            ),
            h(
                'div',
                {
                    style: {
                        padding: '10px 15px 5px',
                        borderBottom: '2px solid #888',
                        letterSpacing: '1px',
                        cursor: 'pointer',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                    },
                    on: {
                        //click: [SELECT_VIEW_SUBMENU, 'events']
                    },
                },
                [arrowIcon(), 'Children Layout']
            ),
            h(
                'div',
                {
                    style: {},
                },
                [
                    h(
                        'div',
                        {
                            style: {
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            },
                        },
                        'Horizontal Align'
                    ),
                    h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['justifyContent'], 'text')]),
                    h(
                        'div',
                        {
                            style: {
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            },
                        },
                        'Vertical Align'
                    ),
                    h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['alignItems'], 'text')]),
                    h(
                        'div',
                        {
                            style: {
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            },
                        },
                        'Direction'
                    ),
                    h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['flexDirection'], 'text')]),
                    h(
                        'div',
                        {
                            style: {
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            },
                        },
                        'Wrap'
                    ),
                    h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['flexWrap'], 'text')]),
                ]
            ),
            h(
                'div',
                {
                    style: {
                        padding: '10px 15px 5px',
                        borderBottom: '2px solid #888',
                        letterSpacing: '1px',
                        cursor: 'pointer',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                    },
                    on: {
                        //click: [SELECT_VIEW_SUBMENU, 'events']
                    },
                },
                [arrowIcon(), 'Design']
            ),
            h(
                'div',
                {
                    style: {},
                },
                [
                    h(
                        'div',
                        {
                            style: {
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            },
                        },
                        'Background Color'
                    ),
                    h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['background'], 'text')]),
                    h(
                        'div',
                        {
                            style: {
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            },
                        },
                        'Opacity'
                    ),
                    h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['opacity'], 'number')]),
                    h(
                        'div',
                        {
                            style: {
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            },
                        },
                        'Borders'
                    ),
                    h(
                        'div',
                        {
                            style: {
                                padding: '0px 20px',
                                display: 'flex',
                                justifyContent: 'space-between',
                            },
                        },
                        [emberEditor(selectedStyle['borderTop'], 'text'), emberEditor(selectedStyle['borderRight'], 'text'), emberEditor(selectedStyle['borderBottom'], 'text'), emberEditor(selectedStyle['borderLeft'], 'text')]
                    ),
                    h(
                        'div',
                        {
                            style: {
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            },
                        },
                        'Border Radius'
                    ),
                    h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['borderRadius'], 'text')]),
                    h(
                        'div',
                        {
                            style: {
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            },
                        },
                        'Box Shadow'
                    ),
                    h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['boxShadow'], 'text')]),
                    h(
                        'div',
                        {
                            style: {
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            },
                        },
                        'Cursor'
                    ),
                    h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['cursor'], 'text')]),
                ]
            ),
            h(
                'div',
                {
                    style: {
                        padding: '10px 15px 5px',
                        borderBottom: '2px solid #888',
                        letterSpacing: '1px',
                        cursor: 'pointer',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                    },
                    on: {
                        //click: [SELECT_VIEW_SUBMENU, 'events']
                    },
                },
                [arrowIcon(), 'Text']
            ),
            state.selectedViewNode.ref === 'vNodeText' || state.selectedViewNode.ref === 'vNodeInput'
                ? h(
                'div',
                {
                    style: {},
                },
                [
                    h(
                        'div',
                        {
                            style: {
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            },
                        },
                        'Font Color'
                    ),
                    h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['color'], 'text')]),
                    h(
                        'div',
                        {
                            style: {
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            },
                        },
                        'Font size'
                    ),
                    h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['fontSize'], 'text')]),
                    h(
                        'div',
                        {
                            style: {
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            },
                        },
                        'Font Family'
                    ),
                    h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['fontFamily'], 'text')]),
                    h(
                        'div',
                        {
                            style: {
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            },
                        },
                        'Font Weight'
                    ),
                    h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['fontWeight'], 'text')]),
                    h(
                        'div',
                        {
                            style: {
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            },
                        },
                        'Font Style'
                    ),
                    h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['fontStyle'], 'text')]),
                    h(
                        'div',
                        {
                            style: {
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            },
                        },
                        'Line Height'
                    ),
                    h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['lineHeight'], 'text')]),
                    h(
                        'div',
                        {
                            style: {
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            },
                        },
                        'Text decoration line'
                    ),
                    h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['textDecorationLine'], 'text')]),
                    h(
                        'div',
                        {
                            style: {
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            },
                        },
                        'Letter spacing'
                    ),
                    h('div', {style: {padding: '0px 20px'}}, [emberEditor(selectedStyle['letterSpacing'], 'text')]),
                ]
            )
                : h('div'),
        ]
    )
}