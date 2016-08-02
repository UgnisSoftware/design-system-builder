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
    onNodeClicked: (event) => dispatch(focusNode(event.target.value)),
})

const Component = (props) =>
    <div style={{flex: '1'}}>
        <h2>Edit Component</h2>
        {props.nodes[props.selectedNodeId].parentIds.map((nodeId)=>
            <button value={nodeId} onClick={props.onNodeClicked}>Parent</button>
        )}
        <div>{props.nodes[props.selectedNodeId].title} {props.nodes[props.selectedNodeId].type}</div>
        background-color: <input value={props.nodes[props.selectedNodeId].style.backgroundColor} onChange={props.onBgColorChange} />
        {props.nodes[props.selectedNodeId].type !== 'text' ?
            <div>
                <button onClick={props.onAddText}>Add Text</button>
                <button onClick={props.onAddBox}>Add Box</button>
            </div>:
            <div>
            text: <input value={props.nodes[props.selectedNodeId].text} onChange={props.onTextChange} />
            </div>
        }
        {props.nodes[props.selectedNodeId].childrenIds.map((nodeId)=>
            <button value={nodeId} onClick={props.onNodeClicked}>Child</button>
        )}
    </div>

export default connect(mstp, mdtp)(Component)