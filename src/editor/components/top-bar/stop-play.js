import React from 'react'
import { state } from 'lape'
import { PlayIcon, PauseIcon } from '../icons'
import { FREEZER_CLICKED } from '../../events'

export default () => (
    <div
        onClick={FREEZER_CLICKED}
        style={{
            position: 'absolute',
            right: '55px',
            top: '0px',
            fontSize: '30px',
            height: '30px',
            cursor: 'pointer',
            padding: '10px',
            transition: '0.2s color',
            userSelect: 'none',
            color: state.appIsFrozen ? 'rgb(91, 204, 91)' : 'rgb(204, 91, 91)',
        }}
    >
        {state.appIsFrozen ? <PlayIcon /> : <PauseIcon />}
    </div>
)
