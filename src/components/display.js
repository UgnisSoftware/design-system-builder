import React from 'react'
import { connect } from 'react-redux'
import { focusNode } from '../redux/actions/nodes'

const mstp = (state)=> ({
    nodes: state.nodes,
    selectedNodeId: state.ui.selectedNodeId,
})

const mdtp = (dispatch, props)=> ({
    onNodeClicked: (value, event) => {event.stopPropagation(); dispatch(focusNode(value))},
})

const Component = (props) => {

    const mapChildren = (childrenIds) => childrenIds.map((nodeId)=>
        props.nodes[nodeId].type === 'box' ? <div onClick={props.onNodeClicked.bind(null, nodeId)} style={{...props.nodes[nodeId].style, boxShadow: nodeId === props.selectedNodeId ? ' 0px 0px 58px 2px rgba(96,168,232,1)' : ''}}>{mapChildren(props.nodes[nodeId].childrenIds)}</div> :
        props.nodes[nodeId].type === 'text' ? <div onClick={props.onNodeClicked.bind(null, nodeId)}>{props.nodes[nodeId].text}</div> :
        props.nodes[nodeId].type === 'input' ? <input onClick={props.onNodeClicked.bind(null, nodeId)}>{props.nodes[nodeId].text}</input> :
        null
    )

    return (
        <div style={{flex: '1', border: '1px solid black'}}>
            {mapChildren([0])}
        </div>
    )
}

export default connect(mstp, mdtp)(Component)