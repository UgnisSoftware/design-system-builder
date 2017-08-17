import h from 'snabbdom/h'
import { fullscreenIcon } from '../icons'
import { FULL_SCREEN_CLICKED } from '../../events'

export default () =>
    h(
        'div',
        {
            on: {
                click: FULL_SCREEN_CLICKED,
            },
            style: {
                position: 'absolute',
                right: '5px',
                top: '0px',
                fontSize: '30px',
                height: '30px',
                cursor: 'pointer',
                padding: '10px',
                color: '#303030',
            },
        },
        [fullscreenIcon()]
    )
