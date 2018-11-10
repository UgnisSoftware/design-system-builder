import * as React from 'react'
import styled from 'styled-components'

import state from '@state'
import { RouterPaths } from '@src/interfaces'

import AddComponentInput from './AddComponentInput'
import ComponentItem from './ComponentItem'
import { route } from '@src/editor/actions'
import { Colors } from '@src/styles'
import PlusSign from '@components/PlusSign'

interface ItemProps {
  selected?: boolean
}

const LeftMenuBox = styled.div`
  box-shadow: rgba(0, 0, 0, 0.12) 2px 2px 2px;
  background: rgb(248, 248, 248);
  flex: 0 0 200px;
  user-select: none;
  padding-top: 16px;
`

const Title = styled.div`
  position: relative;
  font-size: 20px;
  font-weight: 300;
  color: ${(props: ItemProps) => (props.selected ? Colors.accent : Colors.grey)};
  padding: 10px 16px 10px 16px;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  &:hover {
    filter: brightness(0.8);
  }
`

const AddComponentBox = styled.div`
  cursor: pointer;
  width: 16px;
  height: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 7%;
  margin-left: 10px;
  vertical-align: middle;
  line-height: 45px;
  color: rgb(152, 161, 164);
  transition: all 200ms ease;

  &:hover {
    color: ${Colors.accent};
  }
`

const addComponent = () => {
  state.ui.addingComponent = true
}

const LeftMenu = () => (
  <LeftMenuBox>
    <Title onClick={route(RouterPaths.styles)} selected={state.router.path === RouterPaths.styles}>
      Styles
    </Title>
    <Title>
      Components
      {!state.ui.addingComponent && (
        <AddComponentBox onClick={addComponent}>
          <PlusSign />
        </AddComponentBox>
      )}
    </Title>
    {state.ui.addingComponent && <AddComponentInput />}
    {Object.keys(state.components).map(componentId => (
      <ComponentItem key={componentId} id={componentId} />
    ))}
  </LeftMenuBox>
)

export default LeftMenu
