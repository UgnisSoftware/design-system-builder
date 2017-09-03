import React from 'react'
import { state } from 'lape'
import { CHANGE_MENU } from '../../events'
import { HistoryIcon } from '../icons'

export default () => (
    <div
        style={{
            height: '50px',
            fontSize: '15px',
            fontWeight: '500',
            display: 'flex',
            letterSpacing: '1px',
            fontKerning: 'none',
        }}
    >
        <div
            style={{
                cursor: 'pointer',
                flex: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: state.selectedMenu === 'view' ? 'inherit' : '#303030',
                color: state.selectedMenu === 'view' ? '#53d486' : '#d4d4d4',
            }}
            onClick={() => CHANGE_MENU('view')}
        >
            VIEW
        </div>
        <div
            style={{
                cursor: 'pointer',
                flex: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: state.selectedMenu === 'state' ? 'inherit' : '#303030',
                color: state.selectedMenu === 'state' ? '#53d486' : '#d4d4d4',
            }}
            onClick={() => CHANGE_MENU('state')}
        >
            STATE
        </div>
        <div
            style={{
                cursor: 'pointer',
                flex: '0 0 60px',
                fontSize: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: state.selectedMenu === 'events' ? 'inherit' : '#303030',
                color: state.selectedMenu === 'events' ? '#53d486' : '#d4d4d4',
            }}
            onClick={() => CHANGE_MENU('events')}
        >
            <HistoryIcon />
        </div>
    </div>
)
