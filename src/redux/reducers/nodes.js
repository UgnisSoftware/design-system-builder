import update from 'react-addons-update'
import { BG_CHANGE } from '../actions/ui'
import { ADD_CHILD, TEXT_CHANGE } from '../actions/nodes'

const defaultState = [
    {
        type: 'box',
        style: {backgroundColor: '#cccccc', padding: '20px'},
        parentIds: [],
        childrenIds: [1, 2, 5]
    },
    {
        type: 'box',
        style: {border: '1px solid black', cursor: 'pointer', display: 'inline-block', padding: '20px'},
        parentIds: [0],
        childrenIds: [3],
        onClick: [0]
    },
    {
        type: 'box',
        style: {border: '1px solid black', cursor: 'pointer', display: 'inline-block', padding: '20px'},
        parentIds: [0],
        childrenIds: [4],
        onClick: [1]
    },
    {
        value: [
            {
                type: 'string',
                value: '+',
            },
        ],
        type: 'text',
        style: {backgroundColor: 'lime', padding: '20px'},
        parentIds: [1],
        childrenIds: []
    },
    {
        value: [
            {
                type: 'string',
                value: '-',
            },
        ],
        type: 'text',
        style: {backgroundColor: 'magenta', padding: '20px'},
        parentIds: [2],
        childrenIds: []
    },

    {
        value: [
            {
                type: 'string',
                value: 'Current Value: ',
            },
            {
                type: 'state',
                id: 0,
            },
        ],
        type: 'text',
        style: {backgroundColor: 'magenta', padding: '20px'},
        parentIds: [2],
        childrenIds: []
    },
]

export default (state = defaultState, action)=> {
    switch (action.type) {
        case BG_CHANGE:
            return update(state, {[action.selectedNodeId]: { style: { backgroundColor: {$set: action.color}}}})
         case TEXT_CHANGE:
            return update(state, {[action.selectedNodeId]: { text: {$set: action.text}}})
        case ADD_CHILD: {
            return update(state, {
                [action.randomId]: {
                    $set: {
                        title: 'RandomTitle',
                        type: action.boxType,
                        style: {backgroundColor: action.randomColor, padding: '20px'},
                        parentIds: [action.selectedNodeId],
                        childrenIds: []
                    }
                },
                [action.selectedNodeId]: {childrenIds: {$push: [action.randomId] }}
            })
        }
        default:
            return state

    }
}