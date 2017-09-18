import React from 'react'
import { state, setState } from 'lape'
import R from 'ramda'
import { IfIcon } from '../icons'
import { uuid } from '../../utils'

function ADD_NEW_BRANCH(splitRef) {
    const defaultPipeRef = state.definitionList[state.currentDefinitionId][splitRef.ref][splitRef.id].defaultValue
    const defaultPipe = state.definitionList[state.currentDefinitionId][defaultPipeRef.ref][defaultPipeRef.id]

    const newBranchId = uuid()
    const newTestPipeId = uuid()
    const newValuePipeId = uuid()

    const newBranch = {
        test: {
            ref: 'pipe',
            id: newTestPipeId,
        },
        value: {
            ref: 'pipe',
            id: newValuePipeId,
        },
    }
    const newPipes = {
        [newTestPipeId]: {
            type: 'boolean',
            value: true,
            transformations: [],
        },
        [newValuePipeId]: {
            type: defaultPipe.type,
            value: defaultPipe.value,
            transformations: [],
        },
    }

    setState(
        R.evolve({
            definitionList: {
                [state.currentDefinitionId]: {
                    pipe: R.merge(newPipes),
                    branch: R.assoc(newBranchId, newBranch),
                    split: {
                        [splitRef.id]: {
                            branches: R.append({
                                ref: 'branch',
                                id: newBranchId,
                            }),
                        },
                    },
                },
            },
        })(state)
    )
}

function BRANCH_PIPE(ref, propertyName) {
    const node = state.definitionList[state.currentDefinitionId][ref.ref][ref.id]
    const oldPipeRef = node[propertyName]

    // if it's already a split, just add a new branch
    if (oldPipeRef.ref === 'split') {
        return ADD_NEW_BRANCH(oldPipeRef)
    }

    const oldPipe = state.definitionList[state.currentDefinitionId][oldPipeRef.ref][oldPipeRef.id]

    const newBranchId = uuid()
    const newSplitId = uuid()
    const newTestPipeId = uuid()
    const newValuePipeId = uuid()

    const newSplit = {
        defaultValue: oldPipeRef,
        branches: [
            {
                ref: 'branch',
                id: newBranchId,
            },
        ],
    }
    const newBranch = {
        test: {
            ref: 'pipe',
            id: newTestPipeId,
        },
        value: {
            ref: 'pipe',
            id: newValuePipeId,
        },
    }
    const newPipes = {
        [newTestPipeId]: {
            type: 'boolean',
            value: true,
            transformations: [],
        },
        [newValuePipeId]: {
            type: oldPipe.type,
            value: oldPipe.value,
            transformations: [],
        },
    }

    setState(
        R.evolve({
            definitionList: {
                [state.currentDefinitionId]: {
                    pipe: R.merge(newPipes),
                    branch: R.assoc(newBranchId, newBranch),
                    split: R.assoc(newSplitId, newSplit),
                    [ref.ref]: {
                        [ref.id]: R.assoc(propertyName, {
                            ref: 'split',
                            id: newSplitId,
                        }),
                    },
                },
            },
        })(state)
    )
}

export default ({ reference, propertyName }) => {
    return (
        <div
            style={{
                color: '#aaa',
                border: '1px solid #aaa',
                borderRadius: '50px',
                display: 'flex',
                cursor: 'pointer',
                padding: '2px',
                marginLeft: '3px',
            }}
            onClick={e => BRANCH_PIPE(reference, propertyName)}
        >
            <IfIcon />
        </div>
    )
}
