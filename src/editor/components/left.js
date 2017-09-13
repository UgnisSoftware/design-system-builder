import React from 'react'
import { state } from 'lape'
import { COMPONENT_HOVERED, COMPONENT_UNHOVERED, SELECT_COMPONENT, ADD_NEW_COMPONENT } from '../events'

import Ugnis from '../../ugnis'

export default () => (
    <div
        style={{
            position: 'fixed',
            top: '50px',
            left: '0',
            overflow: 'auto',
            height: 'calc(100% - 50px)',
            width: state.editorLeftWidth + 'px',
            background: '#f8f8f8',
            boxSizing: 'border-box',
            transition: '0.5s transform',
            boxShadow: '2px 2px 2px rgba(0, 0, 0, 0.12)',
            transform: state.leftOpen ? 'translateZ(0) translateX(0%)' : 'translateZ(0) translateX(-100%)',
            userSelect: 'none',
        }}
        className="better-scrollbar-light"
    >
        {Object.keys(state.definitionList).map(name => (
            <div
                key={name}
                style={{
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: state.currentDefinitionId === name ? '400' : '300',
                    height: '30px',
                    background: state.currentDefinitionId === name ? '#dbdbdb' : state.hoveredComponent === name ? '#e8e8e8' : 'none',
                    transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
                    paddingLeft: '20px',
                    paddingTop: '5px',
                    paddingBottom: '5px',
                    cursor: 'pointer',
                }}
                onMouseOver={COMPONENT_HOVERED.bind(null, name)}
                onMouseOut={COMPONENT_UNHOVERED}
                onClick={SELECT_COMPONENT.bind(null, name)}
            >
                {state.currentDefinitionId === name ? (
                    state.definitionList[state.currentDefinitionId]['vNodeBox']['_rootNode'].title
                ) : (
                    state.definitionList[name]['vNodeBox']['_rootNode'].title
                )}
            </div>
        ))}
        <div
            style={{
                position: 'absolute',
                //transition: 'all 500ms cubic-bezier(0.165, 0.840, 0.440, 1.000)',
                top: 40 * Object.keys(state.definitionList).indexOf(state.currentDefinitionId) + 'px',
                right: '0px',
                width: '3px',
                backgroundColor: '#53d486',
                height: '40px',
                display: 'inline-flex',
            }}
        />
        <Ugnis definition={state.definitionList['Create New Button']} onEvent={ADD_NEW_COMPONENT} />
    </div>
)
