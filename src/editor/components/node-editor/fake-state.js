import h from 'snabbdom/h'
import {
     STATE_DRAGGED, HOVER_MOBILE
} from '../../events'

export default (title, dragRef)=> h(
    'button',
    {
        style: {
            border: 'none',
            cursor: 'pointer',
            display: 'inline-block',
            flex: '0 0 auto',
            position: 'relative',
            transform: 'translateZ(0)',
            margin: '0 auto 0 0',
            boxShadow: 'inset 0 0 0 2px #828282',
            background: '#1e1e1e',
            padding: '4px 7px',
        },
        attrs: {
            title: title
        },
    },
    [
        h(
            'span',
            {
                style: {
                    color: 'white',
                    display: 'inline-block',
                },
                on: {
                    mousedown: [STATE_DRAGGED, dragRef],
                    touchstart: [STATE_DRAGGED, dragRef],
                    touchmove: [HOVER_MOBILE],
                },
            },
            dragRef.id
        ),
    ]
)