import h from 'snabbdom/h'
import {state} from '../state'
import {fullscreenIcon, playIcon, pauseIcon} from './icons'
import {FULL_SCREEN_CLICKED, FREEZER_CLICKED} from '../events'

const fullscreenComponent = ()=> h(
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

const stopPlayComponent = ()=> h(
    'div',
    {
        on: {
            click: FREEZER_CLICKED,
        },
        style: {
            position: 'absolute',
            right: '55px',
            top: '0px',
            fontSize: '30px',
            height: '30px',
            cursor: 'pointer',
            padding: '10px',
            color: state.appIsFrozen ? 'rgb(91, 204, 91)' : 'rgb(204, 91, 91)',
        },
    },
    state.appIsFrozen ? [playIcon()] : [pauseIcon()]
)


export default ()=> h(
    'div',
    {
        style: {
            flex: '1 auto',
            height: '50px',
            maxHeight: '50px',
            minHeight: '50px',
            background: '#f8f8f8',
            boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px',
            display: 'flex',
            justifyContent: 'center',
            //paddingRight: state.editorRightWidth + 'px',
            //paddingLeft: state.editorLeftWidth + 'px',
        },
    },
    [
        h(
            'div',
            {
                style: {
                    fontSize: '20px',
                    fontWeight: '300',
                    color: '#8e8e8e',
                    position: 'absolute',
                    top: '17px',
                    left: '20px',
                    cursor: 'default',
                    userSelect: 'none',
                },
            },
            'Components'
        ),
        h(
            'a',
            {
                style: {
                    flex: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'inherit',
                    userSelect: 'none',
                },
                attrs: { href: '/' },
            },
            [
                h('img', {
                    attrs: {
                        src: '/images/logo_new256x256.png',
                        height: '37',
                    },
                }),
            ]
        ),
        fullscreenComponent(),
        stopPlayComponent(),
    ]
)