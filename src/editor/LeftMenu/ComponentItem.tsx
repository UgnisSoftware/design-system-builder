import * as React from 'react'
import styled, { css } from 'styled-components'
import ClickOutside from 'react-click-outside'

import state from '@state'
import { Component } from '@src/interfaces'
import TextInput from '@components/TextInput'
import { Colors } from '@src/styles'

interface ItemProps {
  selected?: boolean
}
export const Item = styled.div`
  font-size: 16px;
  font-weight: 400;
  color: ${Colors.grey900};
  line-height: 40px;
  height: 40px;
  transition: background 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;
  padding-left: 24px;
  cursor: pointer;
  &:hover {
    background: rgb(238, 238, 238);
  }
  ${(props: ItemProps) =>
    props.selected &&
    css`
      color: ${Colors.grey900};
      font-weight: 500;
      background: rgb(238, 238, 238);
      border-right: 3px solid rgb(83, 212, 134);
    `};
`

const Input = styled(TextInput)`
  padding-left: 24px;
  font-weight: 500;
  height: 40px;
  padding-top: 3px;
  display: flex;
  justify-content: center;
  background: rgb(232, 232, 233);
  border-right: 3px solid rgb(83, 212, 134);
`

interface Props {
  component: Component
  onClick: () => void
}

interface State {
  name: string
  isEditingName: boolean
}

class ComponentItem extends React.Component<Props, State> {
  state = {
    name: this.props.component.name,
    isEditingName: false,
  }

  edit = () => {
    this.setState({ isEditingName: true })
  }

  save = () => {
    if (this.state.name) {
      this.props.component.name = this.state.name
      this.setState({ isEditingName: false })
    } else {
      this.closeWithoutSaving()
    }
  }

  closeWithoutSaving = () => {
    this.setState({
      name: this.props.component.name,
      isEditingName: false,
    })
  }

  componentDidMount() {
    document.addEventListener('keydown', this.maybeSave)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.maybeSave)
  }

  maybeSave = e => {
    const ENTER = 13
    const ESCAPE = 27
    if (e.keyCode === ENTER) {
      this.save()
    }
    if (e.keyCode === ESCAPE) {
      this.closeWithoutSaving()
    }
  }

  updateName = e => {
    this.setState({ name: e.target.value })
  }

  render() {
    const component = this.props.component

    if (this.state.isEditingName) {
      return (
        <ClickOutside onClickOutside={this.save}>
          <Input value={this.state.name} name="AddComponent" autoFocus={true} onChange={this.updateName} />
        </ClickOutside>
      )
    }
    return (
      <Item
        onClick={this.props.onClick}
        selected={state.ui.router.componentId === component.id}
        onDoubleClick={this.edit}
      >
        {component.name}
      </Item>
    )
  }
}

export default ComponentItem
