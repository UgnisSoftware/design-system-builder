import React from 'react'
import { state } from 'lape'
import { CHANGE_STATIC_VALUE } from '../../events'
import { ArrowIcon } from '../icons'
import emberEditor from './ember/ember'

export default () => {
    const selectedNode = state.definitionList[state.currentDefinitionId][state.selectedViewNode.ref][state.selectedViewNode.id]
    const selectedStyle = state.definitionList[state.currentDefinitionId].style[selectedNode.style.id]
    return (
        <div className="better-scrollbar" style={{ overflow: 'auto' }}>
            <div
                style={{
                    padding: '15px 15px 5px',
                    borderBottom: '2px solid #888',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <ArrowIcon /> Layout
            </div>
            <div>
                <div
                    style={{
                        display: 'flex',
                    }}
                >
                    <div>
                        <div
                            style={{
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            }}
                        >
                            Class
                        </div>
                        // TODO make into ember
                        <div style={{ padding: '0px 20px' }}>
                            <input
                                style={{
                                    color: 'white',
                                    background: 'none',
                                    outline: 'none',
                                    border: 'none',
                                    boxShadow: 'inset 0 -2px 0 0 #ccc',
                                    width: '100px',
                                }}
                                onInput={e => CHANGE_STATIC_VALUE(state.selectedViewNode, 'class', 'text', e)}
                                value={selectedNode.class === undefined ? '' : selectedNode.class}
                            />
                        </div>
                    </div>
                    <div>
                        <div
                            style={{
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            }}
                        >
                            Id
                        </div>
                        // TODO make into ember
                        <div style={{ padding: '0px 20px' }}>
                            <input
                                style={{
                                    color: 'white',
                                    background: 'none',
                                    outline: 'none',
                                    border: 'none',
                                    boxShadow: 'inset 0 -2px 0 0 #ccc',
                                    width: '100px',
                                }}
                                onInput={e => CHANGE_STATIC_VALUE(state.selectedViewNode, 'id', 'text', e)}
                                value={selectedNode.id === undefined ? '' : selectedNode.id}
                            />
                        </div>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                }}
                            >
                                Flex
                            </div>
                            <div style={{ padding: '0px 20px' }}>{emberEditor(selectedStyle['flex'], 'text')}</div>
                        </div>
                        <div>
                            <div
                                style={{
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                }}
                            >
                                Width
                            </div>
                            <div style={{ padding: '0px 20px' }}>{emberEditor(selectedStyle['width'], 'text')}</div>
                        </div>
                        <div>
                            <div
                                style={{
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                }}
                            >
                                Height
                            </div>
                            <div style={{ padding: '0px 20px' }}>{emberEditor(selectedStyle['height'], 'text')}</div>
                        </div>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                }}
                            >
                                Margin
                            </div>
                            <div style={{ padding: '0px 20px' }}>{emberEditor(selectedStyle['margin'], 'text')}</div>
                        </div>
                        <div>
                            <div
                                style={{
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                }}
                            >
                                Padding
                            </div>
                            <div style={{ padding: '0px 20px' }}>{emberEditor(selectedStyle['padding'], 'text')}</div>
                        </div>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                }}
                            >
                                Position
                            </div>
                            <div style={{ padding: '0px 20px' }}>
                                {emberEditor(selectedStyle['position'], { type: 'variant', values: ['relative', 'absolute'] })}
                            </div>
                        </div>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                }}
                            >
                                Top
                            </div>
                            <div style={{ padding: '0px 20px' }}>{emberEditor(selectedStyle['top'], 'text')}</div>
                        </div>
                        <div>
                            <div
                                style={{
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                }}
                            >
                                Bottom
                            </div>
                            <div style={{ padding: '0px 20px' }}>{emberEditor(selectedStyle['bottom'], 'text')}</div>
                        </div>
                        <div>
                            <div
                                style={{
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                }}
                            >
                                Left
                            </div>
                            <div style={{ padding: '0px 20px' }}>{emberEditor(selectedStyle['Left'], 'text')}</div>
                        </div>
                        <div>
                            <div
                                style={{
                                    padding: '20px 20px 5px 20px',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    letterSpacing: '1px',
                                    color: '#8e8e8e',
                                }}
                            >
                                Right
                            </div>
                            <div style={{ padding: '0px 20px' }}>{emberEditor(selectedStyle['right'], 'text')}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div
                style={{
                    padding: '15px 15px 5px',
                    borderBottom: '2px solid #888',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <ArrowIcon /> Children Layout
            </div>

            <div
                style={{
                    display: 'flex',
                }}
            >
                <div>
                    <div
                        style={{
                            padding: '20px 20px 5px 20px',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                            letterSpacing: '1px',
                            color: '#8e8e8e',
                        }}
                    >
                        Horizontal Align
                    </div>
                    <div style={{ padding: '0px 20px' }}>
                        {emberEditor(selectedStyle['justifyContent'], {
                            type: 'variant',
                            values: ['flex-start', 'flex-end', 'center', 'stretch', 'space-between', 'space-around'],
                        })}
                    </div>
                </div>
                <div>
                    <div
                        style={{
                            padding: '20px 20px 5px 20px',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                            letterSpacing: '1px',
                            color: '#8e8e8e',
                        }}
                    >
                        Vertical Align
                    </div>
                    <div style={{ padding: '0px 20px' }}>
                        {emberEditor(selectedStyle['alignItems'], {
                            type: 'variant',
                            values: ['flex-start', 'flex-end', 'center', 'stretch'],
                        })}
                    </div>
                </div>
                <div>
                    <div
                        style={{
                            padding: '20px 20px 5px 20px',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                            letterSpacing: '1px',
                            color: '#8e8e8e',
                        }}
                    >
                        Direction
                    </div>
                    <div style={{ padding: '0px 20px' }}>
                        {emberEditor(selectedStyle['flexDirection'], { type: 'variant', values: ['row', 'column'] })}
                    </div>
                </div>
                <div>
                    <div
                        style={{
                            padding: '20px 20px 5px 20px',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                            letterSpacing: '1px',
                            color: '#8e8e8e',
                        }}
                    >
                        Wrap
                    </div>
                    <div style={{ padding: '0px 20px' }}>
                        {emberEditor(selectedStyle['flexWrap'], { type: 'variant', values: ['wrap', 'nowrap'] })}
                    </div>
                </div>
            </div>
            <div
                style={{
                    padding: '15px 15px 5px',
                    borderBottom: '2px solid #888',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <ArrowIcon /> Design
            </div>
            <div
                style={{
                    display: 'flex',
                }}
            >
                <div>
                    <div
                        style={{
                            padding: '20px 20px 5px 20px',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                            letterSpacing: '1px',
                            color: '#8e8e8e',
                        }}
                    >
                        Background
                    </div>
                    <div style={{ padding: '0px 20px' }}>{emberEditor(selectedStyle['background'], 'text')}</div>
                </div>
                <div>
                    <div
                        style={{
                            padding: '20px 20px 5px 20px',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                            letterSpacing: '1px',
                            color: '#8e8e8e',
                        }}
                    >
                        Opacity
                    </div>
                    <div style={{ padding: '0px 20px' }}>{emberEditor(selectedStyle['opacity'], 'number')}</div>
                </div>
                <div>
                    <div
                        style={{
                            padding: '20px 20px 5px 20px',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                            letterSpacing: '1px',
                            color: '#8e8e8e',
                        }}
                    >
                        Borders
                    </div>
                    <div style={{ padding: '0px 20px' }}>{emberEditor(selectedStyle['border'], 'text')}</div>
                </div>
                <div>
                    <div
                        style={{
                            padding: '20px 20px 5px 20px',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                            letterSpacing: '1px',
                            color: '#8e8e8e',
                        }}
                    >
                        Border Radius
                    </div>
                    <div style={{ padding: '0px 20px' }}>{emberEditor(selectedStyle['borderRadius'], 'text')}</div>
                </div>
                <div>
                    <div
                        style={{
                            padding: '20px 20px 5px 20px',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                            letterSpacing: '1px',
                            color: '#8e8e8e',
                        }}
                    >
                        Box Shadow
                    </div>
                    <div style={{ padding: '0px 20px' }}>{emberEditor(selectedStyle['boxShadow'], 'text')}</div>
                </div>
                <div>
                    <div
                        style={{
                            padding: '20px 20px 5px 20px',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                            letterSpacing: '1px',
                            color: '#8e8e8e',
                        }}
                    >
                        Cursor
                    </div>
                    <div style={{ padding: '0px 20px' }}>{emberEditor(selectedStyle['cursor'], 'text')}</div>
                </div>
                <div>
                    <div
                        style={{
                            padding: '20px 20px 5px 20px',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                            letterSpacing: '1px',
                            color: '#8e8e8e',
                        }}
                    >
                        Transition
                    </div>
                    <div style={{ padding: '0px 20px' }}>{emberEditor(selectedStyle['transition'], 'text')}</div>
                </div>
            </div>
            {state.selectedViewNode.ref === 'vNodeText' || state.selectedViewNode.ref === 'vNodeInput' ? (
                <div
                    style={{
                        padding: '15px 15px 5px',
                        borderBottom: '2px solid #888',
                        letterSpacing: '1px',
                        cursor: 'pointer',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <ArrowIcon /> Text
                </div>
            ) : (
                ''
            )}
            {state.selectedViewNode.ref === 'vNodeText' || state.selectedViewNode.ref === 'vNodeInput' ? (
                <div
                    style={{
                        display: 'flex',
                    }}
                >
                    <div>
                        <div
                            style={{
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            }}
                        >
                            Font Color
                        </div>
                        <div style={{ padding: '0px 20px' }}>{emberEditor(selectedStyle['color'], 'text')}</div>
                    </div>
                    <div>
                        <div
                            style={{
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            }}
                        >
                            Font Size
                        </div>
                        <div style={{ padding: '0px 20px' }}>{emberEditor(selectedStyle['fontSize'], 'text')}</div>
                    </div>
                    <div>
                        <div
                            style={{
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            }}
                        >
                            Font Family
                        </div>
                        <div style={{ padding: '0px 20px' }}>{emberEditor(selectedStyle['fontFamily'], 'text')}</div>
                    </div>
                    <div>
                        <div
                            style={{
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            }}
                        >
                            Font Weight
                        </div>
                        <div style={{ padding: '0px 20px' }}>{emberEditor(selectedStyle['fontWeight'], 'text')}</div>
                    </div>
                    <div>
                        <div
                            style={{
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            }}
                        >
                            Font Style
                        </div>
                        <div style={{ padding: '0px 20px' }}>{emberEditor(selectedStyle['fontStyle'], 'text')}</div>
                    </div>
                    <div>
                        <div
                            style={{
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            }}
                        >
                            Line Height
                        </div>
                        <div style={{ padding: '0px 20px' }}>{emberEditor(selectedStyle['lineHeight'], 'text')}</div>
                    </div>
                    <div>
                        <div
                            style={{
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            }}
                        >
                            Text decoration line
                        </div>
                        <div style={{ padding: '0px 20px' }}>{emberEditor(selectedStyle['textDecorationLine'], 'text')}</div>
                    </div>
                    <div>
                        <div
                            style={{
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                            }}
                        >
                            Letter spacing
                        </div>
                        <div style={{ padding: '0px 20px' }}>{emberEditor(selectedStyle['letterSpacing'], 'text')}</div>
                    </div>
                </div>
            ) : (
                ''
            )}
        </div>
    )
}
