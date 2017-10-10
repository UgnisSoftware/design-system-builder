import React from 'react'
import { state, setState } from 'lape'
import { CHANGE_STATE_NODE_TITLE } from '../../../../events'

export default class EditingNode extends React.Component {
    finishEditing = e => {
        if (e.target !== this.refs.inputRef) {
            setState({ ...state, editingTitleNodeId: '' })
        }
    }

    componentDidMount() {
        this.refs.inputRef.focus()
    }

    componentWillMount() {
        document.addEventListener('click', this.finishEditing)
    }
    componentWillUnmount() {
        document.removeEventListener('click', this.finishEditing)
    }

    render() {
        const { stateRef } = this.props
        const stateId = stateRef.id
        const currentState = state.definitionList[state.currentDefinitionId][stateRef.ref][stateId]
        return (
            <input
                ref="inputRef"
                style={{
                    color: 'white',
                    outline: 'none',
                    padding: '4px 7px',
                    boxShadow: 'none',
                    display: 'inline',
                    border: 'none',
                    background: 'none',
                    font: 'inherit',
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    flex: '0 0 auto',
                }}
                onInput={e => CHANGE_STATE_NODE_TITLE(stateRef, e)}
                value={currentState.title}
                data-istitleeditor={true}
            />
        )
    }
}
