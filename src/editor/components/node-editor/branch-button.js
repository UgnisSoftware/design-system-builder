import React from 'react'
import { state, setState } from 'lape'
import R from 'ramda'
import { IfIcon } from '../icons'
import { uuid } from '../../utils'

function BRANCH_PIPE(ref, propertyName) {
    const node = state.definitionList[state.currentDefinitionId][ref.ref][ref.id]
    const oldPipeRef = node[propertyName]
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
            transformations: []
        },
        [newValuePipeId]: {
            type: oldPipe.type,
            value: oldPipe.value,
            transformations: []
        }
    }

    setState(
        R.evolve({
            definitionList: {
                [state.currentDefinitionId]: {
                    pipe: R.merge(newPipes),
                    branch: R.assoc(newBranchId, newBranch),
                    split: R.assoc(newSplitId, newSplit),
                    [ref.ref]: R.assoc(propertyName, {
                        ref: 'split',
                        id: newSplitId
                    }),
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
