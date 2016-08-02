import React from 'react'
import { connect } from 'react-redux'
import { focusNode } from '../redux/actions/nodes'

const mstp = (state)=> ({
    nodes: state.nodes,
    selectedNodeId: state.ui.selectedNodeId,
})

const mdtp = (dispatch, props)=> ({
    onNodeClicked: (event) => dispatch(focusNode(event.target.value)),
})

const Component = (props) => {

    const mapChildren = (children) => children.map((nodeId)=>
        props.nodes[nodeId].type === 'box' ? <button value={nodeId} onClick={props.onNodeClicked} style={{border:'none', background:'none', ...props.nodes[nodeId].style, boxShadow: nodeId === props.selectedNodeId ? ' 0px 0px 58px 2px rgba(96,168,232,1)' : ''}}>{mapChildren(props.nodes[nodeId].childrenIds)}</button> :
        props.nodes[nodeId].type === 'text' ? <button value={nodeId} onClick={props.onNodeClicked} style={{border:'none', background:'none'}}>{props.nodes[nodeId].text}</button> :
        null
    )

    return (
        <div style={{flex: '1', border: '1px solid black'}}>
            <div style={props.nodes['0'].style}>
                {mapChildren(props.nodes['0'].childrenIds)}
            </div>
        </div>
    )
}

export default connect(mstp, mdtp)(Component)