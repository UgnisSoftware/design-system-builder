import React from 'react'
import { ADD_STATE } from '../../../events'
import { ListIcon, IfIcon, TextIcon, NumberIcon } from '../../icons'

const states = [
    {
        title: 'Text',
        icon: TextIcon,
        eventTitle: 'text',
    },
    {
        title: 'Number',
        icon: NumberIcon,
        eventTitle: 'number',
    },
    {
        title: 'If',
        icon: IfIcon,
        eventTitle: 'if',
    },
    {
        title: 'List',
        icon: ListIcon,
        eventTitle: 'list',
    },
]

export default () => (
    <div
        style={{
            fontSize: '32px',
            flex: '0 auto',
            height: '40px',
            maxWidth: '175px',
            display: 'flex',
            alignItems: 'center',
            padding: '15px 0px 10px 0px',
            justifyContent: 'space-between',
        }}
    >
        {states.map(data => (
            <button
                key={data.eventTitle}
                type="button"
                title={data.title}
                style={{
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    color: 'white',
                }}
                onClick={() => ADD_STATE('_rootNameSpace', data.eventTitle)}
            >
                <data.icon />
            </button>
        ))}
    </div>
)
