import * as React from 'react'
import { state } from 'lape'
import TopBar from './top-bar/top-bar'
import Preview from './preview'
import Left from './left'
import Right from './right-bar/right'
import Loading from './loading'
import Component from './right-bar/view/nodes/component'
const root = () => {
    if (state.loading) {
        return <Loading isLoading={true} />
    }
    const styles = {
        root: {
            background: '#ffffff',
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
        },
        main: {
            display: 'flex',
            flex: '1',
            position: 'relative' as 'relative',
        },
        dragWrapper: {
            top: state.mousePosition.y + 'px',
            left: state.mousePosition.x + 'px',
            width: state.editorRightWidth + 'px',
            pointerEvents: 'none' as 'none',
            position: 'fixed' as 'fixed',
            zIndex: 99999,
        },
        circleWrapper: {
            color: '#5bcc5b',
            position: 'absolute',
            top: '0',
            left: '-20px',
        },
    }
    const widthLeft = window.innerWidth - ((state.leftOpen ? state.editorLeftWidth : 0) + (state.rightOpen ? state.editorRightWidth : 0))
    const stylesMiddle = {
        width: state.fullScreen ? '100vw' : widthLeft - 30 + 'px',
        height: state.fullScreen ? '100vh' : '100%',
        background: '#ffffff',
        transform: 'translateZ(0)',
        zIndex: state.fullScreen ? 2000 : 100,
        position: 'fixed' as 'fixed',
        transition: state.fullScreen || (state.editorRightWidth === 425 && state.editorLeftWidth === 200) ? 'all 0.5s' : 'none',
        top: '0',
        left: state.fullScreen ? '0px' : (state.leftOpen ? state.editorLeftWidth : 0) + 15 + 'px',
        display: 'flex',
        flexDirection: 'column' as 'column',
    }
    const previewWrapper = {
        flex: '1 1 auto',
        paddingTop: '20px',
        overflow: 'auto',
    }
    return (
        <div style={styles.root}>
            <Loading isLoading={false} />
            <div style={styles.main}>
                <div style={stylesMiddle}>
                    <TopBar />
                    <div style={previewWrapper}>
                        <Preview />
                    </div>
                </div>
                <Left />
                <Right />
            </div>
            {state.draggedComponentView ? (
                <div style={styles.dragWrapper}>
                    <Component nodeRef={state.draggedComponentView} parentRef={{}} depth={state.draggedComponentView.depth} />
                </div>
            ) : (
                ''
            )}
        </div>
    )
}
export default root
