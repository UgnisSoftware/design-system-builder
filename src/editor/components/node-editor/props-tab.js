import React from 'react'
import { state } from 'lape'
import { CHANGE_COMPONENT_PATH } from '../../events'
import emberEditor from './ember/ember'

export default () => {
    const selectedNode = state.definitionList[state.currentDefinitionId][state.selectedViewNode.ref][state.selectedViewNode.id]
    if (state.selectedViewNode.id === '_rootNode') {
        const inputStyle = {
            color: 'white',
            background: 'none',
            outline: 'none',
            border: 'none',
            boxShadow: 'inset 0 -2px 0 0 #ccc',
        }
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '10px 20px',
                }}
            >
                <div
                    style={{
                        padding: '20px 20px 0 0',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                        letterSpacing: '1px',
                        color: '#8e8e8e',
                    }}
                >
                    react path
                </div>
                <input
                    style={inputStyle}
                    onBlur={(e) => CHANGE_COMPONENT_PATH('reactPath', e)}
                    value={state.definitionList[state.currentDefinitionId]['reactPath']}
                />
                <div
                    style={{
                        padding: '20px 20px 0 0',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                        letterSpacing: '1px',
                        color: '#8e8e8e',
                    }}
                >
                    react native path
                </div>

                <input
                    style={inputStyle}
                    onBlur={(e) => CHANGE_COMPONENT_PATH('reactNativePath', e)}
                    value={state.definitionList[state.currentDefinitionId]['reactNativePath']}
                />
            </div>
        )
    }
    if (state.selectedViewNode.ref === 'vNodeBox') {
        return (
            <div
                style={{
                    textAlign: 'center',
                    marginTop: '100px',
                    color: '#bdbdbd',
                }}
            >
                no data required
            </div>
        )
    }
    if (state.selectedViewNode.ref === 'vNodeText') {
        return (
            <div style={{ overflow: 'auto' }} className={'better-scrollbar'}>
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
                    text
                </div>
                <div style={{ padding: '0 20px' }}>{emberEditor(selectedNode.value, 'text')}</div>
            </div>
        )
    }
    if (state.selectedViewNode.ref === 'vNodeImage') {
        return (
            <div style={{ overflow: 'auto' }} className={'better-scrollbar'}>
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
                    source (url)
                </div>
                <div style={{ padding: '0 20px' }}>{emberEditor(selectedNode.src, 'text')}</div>
            </div>
        )
    }
    if (state.selectedViewNode.ref === 'vNodeInput') {
        return (
            <div style={{ overflow: 'auto' }} className={'better-scrollbar'}>
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
                    text
                </div>
                <div style={{ padding: '0 20px' }}>{emberEditor(selectedNode.value, 'text')}</div>
            </div>
        )
    }
    if (state.selectedViewNode.ref === 'vNodeList') {
        return (
            <div style={{ overflow: 'auto' }} className={'better-scrollbar'}>
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
                    table
                </div>
                <div style={{ padding: '0 20px' }}>{emberEditor(selectedNode.value, 'table')}</div>
            </div>
        )
    }
    if (state.selectedViewNode.ref === 'vNodeIf') {
        return (
            <div style={{ overflow: 'auto' }} className={'better-scrollbar'}>
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
                    true/false
                </div>
                <div style={{ padding: '0 20px' }}>{emberEditor(selectedNode.value, 'boolean')}</div>
            </div>
        )
    }
}
