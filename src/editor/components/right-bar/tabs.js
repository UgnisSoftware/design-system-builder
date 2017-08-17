import h from 'snabbdom/h'
import { state } from '../../state'
import { CHANGE_MENU } from '../../events'
import { historyIcon } from '../icons'

export default () =>
    h(
        'div',
        {
            style: {
                height: '50px',
                fontSize: '15px',
                fontWeight: '500',
                display: 'flex',
                letterSpacing: '1px',
                fontKerning: 'none',
            },
        },
        [
            h(
                'div',
                {
                    style: {
                        cursor: 'pointer',
                        flex: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: state.selectedMenu === 'view' ? 'inherit' : '#303030',
                        color: state.selectedMenu === 'view' ? '#53d486' : '#d4d4d4',
                    },
                    on: { click: [CHANGE_MENU, 'view'] },
                },
                [h('span', 'VIEW')]
            ),
            h(
                'div',
                {
                    style: {
                        cursor: 'pointer',
                        flex: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: state.selectedMenu === 'state' ? 'inherit' : '#303030',
                        color: state.selectedMenu === 'state' ? '#53d486' : '#d4d4d4',
                    },
                    on: { click: [CHANGE_MENU, 'state'] },
                },
                [h('span', 'STATE')]
            ),
            h(
                'div',
                {
                    style: {
                        cursor: 'pointer',
                        flex: '0 0 60px',
                        fontSize: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: state.selectedMenu === 'events' ? 'inherit' : '#303030',
                        color: state.selectedMenu === 'events' ? '#53d486' : '#d4d4d4',
                    },
                    on: { click: [CHANGE_MENU, 'events'] },
                },
                [historyIcon()]
            ),
        ]
    )
