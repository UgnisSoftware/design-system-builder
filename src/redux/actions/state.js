export const ADD_STATE = 'ADD_STATE'

export function onAddState(name, value) {
    return (dispatch, getState)=> {
        dispatch({type: ADD_STATE, name, value})
    }
}