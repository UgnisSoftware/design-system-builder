import React from 'react'
import { state } from 'lape'
import { CHANGE_STATIC_VALUE } from '../../events'
import { ArrowIcon } from '../icons'
import emberEditor from './ember/ember'
import BranchButton from './branch-button'

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
                <div>
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
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                Flex
                                <BranchButton reference={selectedNode.style} propertyName={'flex'} />
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
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                Width
                                <BranchButton reference={selectedNode.style} propertyName={'width'} />
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
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                Height
                                <BranchButton reference={selectedNode.style} propertyName={'height'} />
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
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                Margin
                                <BranchButton reference={selectedNode.style} propertyName={'margin'} />
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
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                Padding
                                <BranchButton reference={selectedNode.style} propertyName={'padding'} />
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
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                Position
                                <BranchButton reference={selectedNode.style} propertyName={'position'} />
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
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                Top
                                <BranchButton reference={selectedNode.style} propertyName={'top'} />
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
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                Bottom
                                <BranchButton reference={selectedNode.style} propertyName={'bottom'} />
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
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                Left
                                <BranchButton reference={selectedNode.style} propertyName={'left'} />
                            </div>
                            <div style={{ padding: '0px 20px' }}>{emberEditor(selectedStyle['left'], 'text')}</div>
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
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                Right
                                <BranchButton reference={selectedNode.style} propertyName={'right'} />
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

            <div>
                <div>
                    <div
                        style={{
                            padding: '20px 20px 5px 20px',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                            letterSpacing: '1px',
                            color: '#8e8e8e',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        Horizontal Align
                        <BranchButton reference={selectedNode.style} propertyName={'justifyContent'} />
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
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        Vertical Align
                        <BranchButton reference={selectedNode.style} propertyName={'alignItems'} />
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
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        Direction
                        <BranchButton reference={selectedNode.style} propertyName={'flexDirection'} />
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
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        Wrap
                        <BranchButton reference={selectedNode.style} propertyName={'flexWrap'} />
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
            <div>
                <div>
                    <div
                        style={{
                            padding: '20px 20px 5px 20px',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                            letterSpacing: '1px',
                            color: '#8e8e8e',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        Background
                        <BranchButton reference={selectedNode.style} propertyName={'background'} />
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
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        Opacity
                        <BranchButton reference={selectedNode.style} propertyName={'opacity'} />
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
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        Borders
                        <BranchButton reference={selectedNode.style} propertyName={'border'} />
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
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        Border Radius
                        <BranchButton reference={selectedNode.style} propertyName={'borderRadius'} />
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
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        Box Shadow
                        <BranchButton reference={selectedNode.style} propertyName={'boxShadow'} />
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
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        Cursor
                        <BranchButton reference={selectedNode.style} propertyName={'cursor'} />
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
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        Transition
                        <BranchButton reference={selectedNode.style} propertyName={'transition'} />
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
                <div>
                    <div>
                        <div
                            style={{
                                padding: '20px 20px 5px 20px',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                color: '#8e8e8e',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            Font Color
                            <BranchButton reference={selectedNode.style} propertyName={'color'} />
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
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            Font Size
                            <BranchButton reference={selectedNode.style} propertyName={'fontSize'} />
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
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            Font Family
                            <BranchButton reference={selectedNode.style} propertyName={'fontFamily'} />
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
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            Font Weight
                            <BranchButton reference={selectedNode.style} propertyName={'fontWeight'} />
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
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            Font Style
                            <BranchButton reference={selectedNode.style} propertyName={'fontStyle'} />
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
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            Line Height
                            <BranchButton reference={selectedNode.style} propertyName={'lineHeight'} />
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
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            Text decoration line
                            <BranchButton reference={selectedNode.style} propertyName={'textDecorationLine'} />
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
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            Letter spacing
                            <BranchButton reference={selectedNode.style} propertyName={'letterSpacing'} />
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
