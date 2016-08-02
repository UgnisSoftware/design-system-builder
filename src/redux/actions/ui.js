export const BG_CHANGE = 'BG_CHANGE'

export function onChangeBgColor(color) {
    return (dispatch, getState)=> {
        dispatch({type: BG_CHANGE, color, selectedNodeId: getState().ui.selectedNodeId})
    }
}