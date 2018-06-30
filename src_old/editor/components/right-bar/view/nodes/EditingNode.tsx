import * as React from 'react'
import { CHANGE_VIEW_NODE_TITLE } from '../../../../events'
import { state, setState } from 'lape'

interface EditingNodeInterface {
    nodeRef: any
}
export default class EditingNode extends React.Component<EditingNodeInterface, any> {
    private inputRef: HTMLInputElement

    finishEditing = e => {
        if (e.target !== this.inputRef) {
            setState({ ...state, editingTitleNodeId: '' })
        }
    }
    componentDidMount() {
        this.inputRef.focus()
    }
    UNSAFE_componentWillMount() {
        document.addEventListener('click', this.finishEditing)
    }
    UNSAFE_componentWillUMount() {
        document.removeEventListener('click', this.finishEditing)
    }
    render() {
        const { nodeRef } = this.props
        return (
            <input
                ref={node => (this.inputRef = node)}
                style={{
                    border: 'none',
                    background: 'none',
                    color: '#53d486',
                    outline: 'none',
                    flex: '1',
                    padding: '0',
                    boxShadow: 'inset 0 -1px 0 0 #53d486',
                    font: 'inherit',
                    marginLeft: '5px',
                }}
                onInput={e => CHANGE_VIEW_NODE_TITLE(nodeRef, e)}
                value={state.definitionList[state.currentDefinitionId][nodeRef.ref][nodeRef.id].title}
                data-istitleeditor={true}
            />
        )
    }
}
