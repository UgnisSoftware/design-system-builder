import h from 'snabbdom/h'
import {state} from '../state'
import app from '../live-app'

export default ()=> h(
    'div',
    {
        style: {
            flex: '1 auto',
            backgroundPositionX: '0px, 8px, 0px, 8px',
            backgroundPositionY: '0px, 8px, 1px, 9px',
            backgroundColor: '#e9e9e9',
            backgroundSize: '16px 16px',
            display: 'relative',
            overflow: 'auto',
        },
    },
    [
        h(
            'div',
            {
                style: (() => {
                    const topMenuHeight = 50
                    const widthLeft = window.innerWidth - ((state.leftOpen ? state.editorLeftWidth : 0) + (state.rightOpen ? state.editorRightWidth : 0))
                    const heightLeft = window.innerHeight - topMenuHeight
                    return {
                        width: state.fullScreen ? '100vw' : widthLeft - 30 + 'px',
                        height: state.fullScreen ? '100vh' : heightLeft - 30 + 'px',
                        background: '#ffffff',
                        transform: 'translateZ(0)',
                        zIndex: state.fullScreen ? '2000' : '100',
                        //boxShadow: 'rgba(0, 0, 0, 0.16) 0px 3px 10px, rgba(0, 0, 0, 0.23) 0px 3px 10px',
                        position: 'fixed',
                        transition: state.fullScreen || (state.editorRightWidth === 425 && state.editorLeftWidth === 200) ? 'all 0.5s' : 'none', // messes up the closing of full screen, but works in 99% of cases
                        top: state.fullScreen ? '0px' : 15 + topMenuHeight + 'px',
                        left: state.fullScreen ? '0px' : (state.leftOpen ? state.editorLeftWidth : 0) + 15 + 'px',
                    }
                })(),
            },
            [
                h(
                    'div',
                    {
                        style: {
                            overflow: 'auto',
                            display: 'flex',
                            width: '100%',
                            height: '100%',
                        },
                    },
                    [app.vdom]
                ),
            ]
        ),
    ]
)