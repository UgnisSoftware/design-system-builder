import update from 'react-addons-update'
import { BG_CHANGE } from '../actions/ui'
import { ADD_CHILD, TEXT_CHANGE } from '../actions/nodes'

const defaultState = {
    0: {
        title: 'document',
        type: 'box',
        style: {backgroundColor: '#cccccc', padding: '20px'},
        parentIds: [],
        childrenIds: []
    }
}

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