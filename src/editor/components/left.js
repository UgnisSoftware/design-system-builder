import React from 'react'
import { state } from 'lape'
import { COMPONENT_HOVERED, COMPONENT_UNHOVERED, SELECT_COMPONENT, ADD_NEW_COMPONENT } from '../events'

import Ugnis from '../../ugnis'

export default () => (
    <div
        style={{
            position: 'fixed',
            left: '0',
            top: '0',
            overflow: 'auto',
            height: '100%',
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
        <div
            style={{
                fontSize: '20px',
                fontWeight: '300',
                color: '#8e8e8e',
                marginTop: '20px',
                marginBottom: '10px',
                marginLeft: '10px',
                cursor: 'default',
                userSelect: 'none',
            }}
        >
            Styles
        </div>
        <div
            style={{
                fontWeight: '300',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                height: '30px',
                transition: 'background 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
                paddingLeft: '20px',
                paddingTop: '5px',
                paddingBottom: '5px',
                cursor: 'pointer',
            }}
        >
            Colors
        </div>
        <div
            style={{
                fontWeight: '300',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                height: '30px',
                transition: 'background 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
                paddingLeft: '20px',
                paddingTop: '5px',
                paddingBottom: '5px',
                cursor: 'pointer',
            }}
        >
            Fonts
        </div>

        <div
            style={{
                fontSize: '20px',
                fontWeight: '300',
                color: '#8e8e8e',
                marginTop: '20px',
                marginBottom: '10px',
                marginLeft: '10px',
                cursor: 'default',
                userSelect: 'none',
            }}
        >
            Components
        </div>
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
                    transition: 'background 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
                    paddingLeft: '20px',
                    paddingTop: '5px',
                    paddingBottom: '5px',
                    cursor: 'pointer',
                }}
                onMouseOver={COMPONENT_HOVERED.bind(null, name)}
                onMouseOut={COMPONENT_UNHOVERED}
                onClick={SELECT_COMPONENT.bind(null, name)}
            >
                {state.currentDefinitionId === name
                    ? state.definitionList[state.currentDefinitionId]['vNodeBox']['_rootNode'].title
                    : state.definitionList[name]['vNodeBox']['_rootNode'].title}
                <div
                    style={{
                        position: 'absolute',
                        opacity: state.currentDefinitionId === name ? '1' : '0',
                        transition: 'opacity 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
                        right: '0px',
                        width: '3px',
                        backgroundColor: '#53d486',
                        height: '40px',
                        display: 'inline-flex',
                    }}
                />
            </div>
        ))}

        <div
            style={{
                fontSize: '20px',
                fontWeight: '300',
                color: '#8e8e8e',
                marginTop: '20px',
                marginBottom: '10px',
                marginLeft: '10px',
                cursor: 'default',
                userSelect: 'none',
            }}
        >
            Pages
        </div>
        <Ugnis definition={state.definitionList['Create New Button']} onEvent={ADD_NEW_COMPONENT} />
    </div>
)
