import React from 'react'
import R from 'ramda'
import { connect } from 'react-redux'

const mstp = (state)=> ({
    nodes: state.nodes
})

const mdtp = (dispatch, props)=> ({
})

const Component = (props) =>
    <div style={{flex: '1', border: '1px solid black'}}>
        <div style={props.nodes['0'].style}>
        {props.nodes['0'].childrenIds.map((nodeId)=>
            props.nodes[nodeId].type === 'box' ?
                <div style={props.nodes[nodeId].style}></div> :
            props.nodes[nodeId].type === 'text' ?
                <span style={props.nodes[nodeId].style}>{props.nodes[nodeId].text}</span> :
            null
        )}
        </div>
    </div>

export default connect(mstp, mdtp)(Component)