import React from 'react'
import { connect } from 'react-redux'

import { onChangeBgColor } from '../redux/actions/ui'
import { onAddChild, focusNode, onTextChange } from '../redux/actions/nodes'

const mstp = (state)=> ({
    nodes: state.nodes,
    selectedNodeId: state.ui.selectedNodeId,
})

const mdtp = (dispatch, props)=> ({
    onBgColorChange: (event) => dispatch(onChangeBgColor(event.target.value)),
    onTextChange: (event) => dispatch(onTextChange(event.target.value)),
    onAddText: (event) => dispatch(onAddChild('text')),
    onAddBox: (event) => dispatch(onAddChild('box')),
    onAddInput: (event) => dispatch(onAddChild('input')),
    onNodeClicked: (event) => dispatch(focusNode(event.target.value)),
})

const Component = (props) =>
    <div style={{flex: '1', border: '1px solid black', padding: '5px'}}>
        {props.nodes[props.selectedNodeId].parentIds.map((nodeId)=>
            <button value={nodeId} onClick={props.onNodeClicked}>Parent</button>
        )}
        {props.nodes[props.selectedNodeId].type !== 'text' ?
            <div>
                background-color: <input value={props.nodes[props.selectedNodeId].style.backgroundColor} onChange={props.onBgColorChange} /><hr/>
                <div onClick={props.onAddText}>Add Text</div>
                <div onClick={props.onAddBox}>Add Box</div>
                <div onClick={props.onAddInput}>Add Input</div>
            </div>:
            <div>
            text: <input value={props.nodes[props.selectedNodeId].text} onChange={props.onTextChange} />
            </div>
        }
        <hr/>
        {props.nodes[props.selectedNodeId].childrenIds.map((nodeId)=>
            <button value={nodeId} onClick={props.onNodeClicked}>{props.nodes[nodeId].type}</button>
        )}
    </div>

export default connect(mstp, mdtp)(Component)