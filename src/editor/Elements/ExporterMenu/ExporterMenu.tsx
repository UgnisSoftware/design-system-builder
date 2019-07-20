import * as React from 'react'
import styled from 'styled-components'
import state from '@state'
import { connect } from 'lape'

const Menu = styled.div`
  transform: translateX(${() => (state.ui.showExportMenu ? '0' : '100%')});
  transition: 0.3s all cubic-bezier(0.25, 0.46, 0.45, 0.94);
  background: rgb(244, 244, 244);
  padding: 64px 24px;
  display: grid;
  grid-gap: 32px;
  align-items: start;
  align-content: start;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 498px;
  overflow: scroll;
  box-shadow: rgba(0, 0, 0, 0.12) 2px 2px 2px;
  background-size: 20px 20px, 20px 20px, 10px 10px, 10px 10px;
  user-select: all;
  z-index: 200;
`

const ExporterMenu = () => {
  return <Menu>TODO exporting menu</Menu>
}

export default connect(ExporterMenu)
