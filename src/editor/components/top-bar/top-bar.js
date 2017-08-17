import h from 'snabbdom/h'
import stopPlayComponent from './stop-play'
import fullscreenComponent from './fullscreen'

export default () =>
    h(
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
                        padding: '0 50px',
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
