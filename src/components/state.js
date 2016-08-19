import React from 'react'
import { connect } from 'react-redux'
import { onAddState } from '../redux/actions/state'

const mstp = (state)=> ({
    state: state.state,
    actions: state.actions,
})
class Component extends React.Component {
    render() {
        const props = this.props;
        return (
            <div style={{flex: '1', border: '1px solid black', padding: '5px'}}>
                {props.state.map((state) =>
                    <div><span style={{color: '#f7941d'}}>{state.name}:</span> {state.value === state.defaultValue ? state.value : state.defaultValue + ' current value: ' + state.value}
                        {state.actions.map((actionId) =>
                            <div style={{color: '#3cb878', paddingLeft: '20px'}}>
                                {props.actions[actionId].type}
                                {props.actions[actionId].mutation.map((mutation)=>
                                    mutation.type === 'state' ?
                                        <span style={{color: '#f7941d'}}> {props.state[mutation.stateId].name} </span> :
                                        <span> {mutation.value} </span>
                                )}
                            </div>
                        )}
                    </div>
                )}
                <div style={{padding: '10px'}}>
                    + Add State
                </div>
            </div>
        )
    }
}

Component.propTypes = {
    state: React.PropTypes.array,
    actions: React.PropTypes.array,
}

export default connect(mstp)(Component)