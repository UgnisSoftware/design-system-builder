import React from 'react'
import { connect } from 'react-redux'
import { focusNode } from '../redux/actions/nodes'

const mstp = (state)=> ({
    nodes: state.nodes,
    selectedNodeId: state.ui.selectedNodeId,
    state: state.state,
    actions: state.actions,
})

const mdtp = (dispatch, props)=> ({
    onNodeClicked: (value, event) => {event.stopPropagation(); dispatch(focusNode(value))},
    dispatch: dispatch,
})

const Component = (props) => {

    const mapChildren = (childrenIds) => childrenIds.map((nodeId)=>
        props.nodes[nodeId].type === 'box' ? <div onClick={props.nodes[nodeId].onClick ? (e) => props.dispatch(props.actions[props.nodes[nodeId].onClick[0]]): undefined} style={{...props.nodes[nodeId].style, boxShadow: nodeId === props.selectedNodeId ? ' 0px 0px 30px 2px rgba(96,168,232,1)' : ''}}>{mapChildren(props.nodes[nodeId].childrenIds)}</div> :
        props.nodes[nodeId].type === 'text' ? <div onClick={props.nodes[nodeId].onClick ? (e) => props.dispatch(props.actions[props.nodes[nodeId].onClick[0]]): undefined}>{props.nodes[nodeId].value.map((value)=> value.type === 'string' ? value.value : value.type === 'state' ? props.state[value.id].value : '')}</div> :
        props.nodes[nodeId].type === 'input' ? <input onClick={props.nodes[nodeId].onClick ? (e) => props.dispatch(props.actions[props.nodes[nodeId].onClick[0]]): undefined}>{props.nodes[nodeId].value}</input> :
        null
    )

    return (
        <div style={{flex: '2', border: '1px solid black'}}>
            {mapChildren([0])}
        </div>
    )
}

export default connect(mstp, mdtp)(Component)