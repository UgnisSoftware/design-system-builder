import * as React from 'react'
import styled from 'styled-components'

import state from '@state'
import { RouterPaths } from '@src/interfaces'

import AddComponentInput from './AddComponentInput'
import ComponentItem, { Item } from './ComponentItem'
import { route } from '@src/editor/actions'

const LeftMenuBox = styled.div`
  box-shadow: rgba(0, 0, 0, 0.12) 2px 2px 2px;
  background: rgb(248, 248, 248);
  flex: 0 0 200px;
  user-select: none;
`

const I = styled.i`
  position: absolute;
  right: 0;
  top: 0;
  color: #8e8e8e;
  font-size: 26px;
  margin-left: auto;
  opacity: 0.4;
  padding: 8px;
  transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;
  &:hover {
    color: #53d585;
    opacity: 1;
  }
`

const Title = styled.div`
  position: relative;
  font-size: 20px;
  font-weight: 300;
  color: #8e8e8e;
  padding: 10px 0 10px 16px;
  margin-top: 10px;
  cursor: default;
  user-select: none;
  display: flex;
  align-items: center;
`

const addComponent = () => {
  state.ui.addingComponent = true
}

const LeftMenu = () => (
  <LeftMenuBox>
    <Title>Styles</Title>
    <Item onClick={route(RouterPaths.colors)} selected={state.router.path === RouterPaths.colors}>
      Colors & Spacing
    </Item>
    <Item onClick={route(RouterPaths.fonts)} selected={state.router.path === RouterPaths.fonts}>
      Fonts
    </Item>
    <Title>
      Components
      {!state.ui.addingComponent && (
        <I className="material-icons" onClick={addComponent}>
          add_box
        </I>
      )}
    </Title>
    {state.ui.addingComponent && <AddComponentInput />}
    {Object.keys(state.components).map(componentId => (
      <ComponentItem key={componentId} id={componentId} />
    ))}
  </LeftMenuBox>
)

export default LeftMenu