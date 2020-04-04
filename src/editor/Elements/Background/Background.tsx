import * as React from 'react'
import styled from 'styled-components'
import stateUi from '@state/ui'

const ElementsWrapper = styled.div`
  background: radial-gradient(#f7f7f7 15%, transparent 16%) 0 0, radial-gradient(#ececec 15%, transparent 16%) 8px 8px,
    radial-gradient(rgba(255, 255, 255, 0.1) 15%, transparent 20%) 0 1px,
    radial-gradient(rgba(255, 255, 255, 0.1) 15%, transparent 20%) 8px 9px;
  background-color: rgb(0, 0, 0, 0.01);
  background-size: 16px 16px;
  transform: translateZ(0);
  align-items: center;
  align-content: center;
  justify-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  display: grid;
`

const unselectComponent = (e) => {
  if (e.currentTarget === e.target) {
    stateUi.selectedNode = null
    stateUi.stateManager = null
    stateUi.editingTextNode = null
    stateUi.showAddComponentMenu = false
    stateUi.showExportMenu = false
    stateUi.showGrid = false
  }
}

const Background = (props) => {
  return <ElementsWrapper onClick={unselectComponent}>{props.children}</ElementsWrapper>
}
export default Background
