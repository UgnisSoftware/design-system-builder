import React from 'react'
import { state } from 'lape'
import { ADD_NODE } from '../../../../events'
import { ListIcon, IfIcon, InputIcon, TextIcon, BoxIcon, ImageIcon } from '../../../icons'

const components = [
    {
        title: 'Box',
        icon: BoxIcon,
        eventTitle: 'box',
    },
    {
        title: 'Text',
        icon: TextIcon,
        eventTitle: 'text',
    },
    {
        title: 'Image',
        icon: ImageIcon,
        eventTitle: 'image',
    },
    {
        title: 'Text Input',
        icon: InputIcon,
        eventTitle: 'input',
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
            maxWidth: '385px',
            flex: '0 auto',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            padding: '15px 0px 10px 0px',
            justifyContent: 'space-between',
        }}
    >
        {components.map(data => (
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
                onClick={() => ADD_NODE(state.selectedViewNode, data.eventTitle)}
            >
                <data.icon />
            </button>
        ))}
    </div>
)
