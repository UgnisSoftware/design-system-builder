import React from 'react'
import { state } from 'lape'
import { STATE_DRAGGED, HOVER_MOBILE } from '../../events'
import fakeState from './fake-state'

function checkInheritedStates(ref, acc = []) {
    const node = state.definitionList[state.currentDefinitionId][ref.ref][ref.id]
    if (ref.id === '_rootNode' || node.parent.id === '_rootNode') {
        return acc
    }
    if (node.parent.ref === 'vNodeList') {
        const parent = state.definitionList[state.currentDefinitionId][node.parent.ref][node.parent.id]
        const tableRef = state.definitionList[state.currentDefinitionId][parent.value.ref][parent.value.id].value
        const table = state.definitionList[state.currentDefinitionId][tableRef.ref][tableRef.id]
        table.columns.forEach(columnRef => {
            acc.push({
                parent: node.parent,
                ...columnRef,
            })
        })
    }

    return checkInheritedStates(node.parent, acc)
}

export default function generateEditNodeComponent() {
    const inheritedStates = checkInheritedStates(state.selectedViewNode)
    return (
        <div style={{ padding: '15px 20px', background: '#1e1e1e', marginTop: 'auto' }}>
            {state.selectedViewSubMenu === 'events' ? (
                <span>
                    <div>
                        <div
                            style={{
                                padding: '0 0 5px 0',
                            }}
                        >
                            Mouse Data:
                        </div>
                        <div
                            style={{
                                background: '#1e1e1e',
                                flex: '0 0 100%',
                                display: 'flex',
                                flexWrap: 'nowrap',
                                padding: '0 0 10px 0',
                            }}
                        >
                            {fakeState('Mouse X position from left', { ref: 'eventData', id: 'screenX' })}
                            {fakeState('Mouse Y position from top', { ref: 'eventData', id: 'screenY' })}
                            {fakeState('Mouse X position from layer left', { ref: 'eventData', id: 'layerX' })}
                            {fakeState('Mouse Y position from layer top', { ref: 'eventData', id: 'layerY' })}
                        </div>
                    </div>
                    {state.selectedViewNode.ref === 'vNodeInput' ? (
                        <div>
                            <div
                                style={{
                                    padding: '0 0 5px 0',
                                }}
                            >
                                Keyboard Data:
                            </div>
                            <div
                                style={{
                                    background: '#1e1e1e',
                                    flex: '0 0 100%',
                                    display: 'flex',
                                    flexWrap: 'nowrap',
                                }}
                            >
                                {fakeState('current value', { ref: 'eventData', id: 'value' })}
                                {fakeState('key pressed', { ref: 'eventData', id: 'keyPressed' })}
                                {fakeState('key pressed code', { ref: 'eventData', id: 'keyPressedCode' })}
                            </div>
                        </div>
                    ) : (
                        ''
                    )}
                    {state.selectedViewNode.id === '_rootNode' ? (
                        <div>
                            <div
                                style={{
                                    padding: '0 0 5px 0',
                                }}
                            >
                                Keyboard Data:
                            </div>
                            <div
                                style={{
                                    flex: '0 0 100%',
                                    display: 'flex',
                                    flexWrap: 'nowrap',
                                    padding: '0 0 10px 0',
                                }}
                            >
                                {fakeState('key pressed', { ref: 'eventData', id: 'keyPressed' })}
                                {fakeState('key pressed code', { ref: 'eventData', id: 'keyPressedCode' })}
                            </div>
                        </div>
                    ) : (
                        ''
                    )}
                </span>
            ) : (
                ''
            )}

            {inheritedStates.length !== 0
                ? inheritedStates.map(stateRef => (
                      <span>
                          <div
                              style={{
                                  padding: '0 0 5px 0',
                              }}
                          >
                              {state.definitionList[state.currentDefinitionId][stateRef.parent.ref][stateRef.parent.id].title}
                          </div>
                          <span
                              style={{
                                  flex: '0 0 auto',
                                  position: 'relative',
                                  transform: 'translateZ(0)',
                                  margin: '0 auto 0 0',
                                  boxShadow: 'inset 0 0 0 2px ' + (state.selectedStateNode.id === stateRef.id ? '#eab65c' : '#828282'),
                                  background: '#1e1e1e',
                                  padding: '4px 7px',
                              }}
                          >
                              <span
                                  style={{
                                      opacity: state.editingTitleNodeId === stateRef.id ? '0' : '1',
                                      color: 'white',
                                      display: 'inline-block',
                                  }}
                                  onMouseDown={e => STATE_DRAGGED(stateRef, e)}
                                  onTouchStart={e => STATE_DRAGGED(stateRef, e)}
                                  onTouchMove={HOVER_MOBILE}
                              >
                                  {state.definitionList[state.currentDefinitionId][stateRef.ref][stateRef.id].title}
                              </span>
                          </span>
                      </span>
                  ))
                : ''}
        </div>
    )
}
