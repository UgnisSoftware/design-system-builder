import React from 'react'
import { state } from 'lape'
import EmptyWarning from './nodes/empty-warning'
import EventList from './nodes/event-list'

export default () => (
    <div
        key="event"
        className="better-scrollbar"
        style={{
            overflow: 'auto',
            position: 'relative',
            flex: '1',
            padding: '20px',
        }}
    >
        <div
            style={{
                fontSize: '12px',
                fontWeight: 'bold',
                letterSpacing: '1px',
                color: '#8e8e8e',
                paddingBottom: '15px',
            }}
        >
            PAST EVENTS
        </div>
        {state.eventStack[state.currentDefinitionId].length === 0 ? <EmptyWarning /> : <EventList />}
    </div>
)
