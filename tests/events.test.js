import R from 'ramda'
import { state, listen, setState, _reset } from 'lape'
import '../src/editor/state.js'
import * as events from '../src/editor/events.js'

const defaultState = state

class MockEvent {
    constructor(target) {
        this.target = target
    }

    preventDefault() {
    }
}

afterEach(() => {
    _reset()
    setState(defaultState)
})

test('setState sets the state', done => {
    done()
})

test('CHANGE_STATE_NODE_TITLE changes state node title', () => {
    function createState(stateRef, title) {
        const currentDefinitionId = '7eddd63b'

        return {
            currentDefinitionId,
            definitionList: {
                [currentDefinitionId]: {
                    [stateRef.ref]: {
                        [stateRef.id]: {
                            title,
                            type: 'text',
                        },
                    },
                },
            },
        }
    }

    const stateRef = {
        ref: 'state',
        id: 'd2588376',
    }

    const oldState = createState(stateRef, 'oldTitle')
    setState(oldState)

    const event = new MockEvent({ value: 'newTitle' })
    events.CHANGE_STATE_NODE_TITLE(stateRef, event)

    const expectedState = createState(stateRef, event.target.value)

    expect(state).toEqual(expectedState)
})

test('DELETE_TRANSFORMATION deletes a specific transformation', () => {
    function createState(pipeRef, transformations) {
        const currentDefinitionId = '7eddd63b'

        return {
            currentDefinitionId,
            definitionList: {
                [currentDefinitionId]: {
                    [pipeRef.ref]: {
                        [pipeRef.id]: {
                            transformations,
                            type: 'text',
                        },
                    },
                },
            },
        }
    }

    const pipeRef = {
        ref: 'pipe',
        id: 'd2588376',
    }

    const unneededTransformationRef = {
        ref: 'toUpperCase',
        id: 'daebf1f2',
    }

    const remainingTransformationRef = {
        ref: 'toLowerCase',
        id: '2beee9a4',
    }

    const oldState = createState(pipeRef, [unneededTransformationRef, remainingTransformationRef])
    setState(oldState)

    events.DELETE_TRANSFORMATION(pipeRef, unneededTransformationRef)

    const expectedState = createState(pipeRef, [remainingTransformationRef])

    expect(state).toEqual(expectedState)
})
