import state from '../state'

const memoizedRefs = {}
function lookForSelectedState(nodeRef) {
    // check if node was memoized, has not changed (immutable reference) and has an answer for seleted state
    if (
        memoizedRefs[nodeRef.id] &&
        memoizedRefs[nodeRef.id].stateDefinition === state.definitionList[state.currentDefinitionId] &&
        memoizedRefs[nodeRef.id].isClosed === state.viewFoldersClosed[nodeRef.id] &&
        memoizedRefs[nodeRef.id][state.selectedStateNodeId] !== undefined
    ) {
        return memoizedRefs[nodeRef.id][state.selectedStateNodeId]
    }
    // check data, style, event mutations
    const value = (() => {
        const node = state.definitionList[state.currentDefinitionId][nodeRef.ref][nodeRef.id]
        const fieldsToCheck = fields[nodeRef.ref]
        for (let i = 0; i < fieldsToCheck.length; i++) {
            const fieldName = fieldsToCheck[i]
            if (node[fieldName] === undefined) continue
            if (node[fieldName].id === state.selectedStateNodeId) return true
            // transformations, children, mutators
            if ((fieldName === 'children' && state.viewFoldersClosed[nodeRef.id]) || fieldName === 'mutators' || fieldName === 'transformations') {
                for (let j = 0; j < node[fieldName].length; j++) {
                    if (lookForSelectedState(node[fieldName][j]) === true) {
                        return true
                    }
                }
            }
            if (node[fieldName].ref) {
                if (lookForSelectedState(node[fieldName]) === true) {
                    return true
                }
            }
        }
        return false
    })()
    memoizedRefs[nodeRef.id] = {
        ...memoizedRefs[nodeRef.id],
        stateDefinition: state.definitionList[state.currentDefinitionId],
        isClosed: state.viewFoldersClosed[nodeRef.id],
        [state.selectedStateNodeId]: value,
    }
    return value
}