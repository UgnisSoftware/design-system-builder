import * as React from 'react'
import styled from 'styled-components'
import ClickOutside from 'react-click-outside'

import state from '@state'
import { uuid } from '@src/editor/utils'
import TextInput from '@components/TextInput'
import { Component, NodeTypes, RouterPaths, ViewTypes } from '@src/interfaces'
import { view } from 'react-easy-state/dist/es.es6'

const Input = styled(TextInput)`
  padding-left: 24px;
  font-weight: 300;
  height: 40px;
  display: flex;
  justify-content: center;
`

class AddComponent extends React.Component {
  state = {
    value: '',
  }

  updateValue = e => {
    this.setState({ value: e.target.value })
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

  closeWithoutSaving = () => {
    state.ui.addingComponent = false
    return
  }

  save = () => {
    if (!this.state.value) {
      this.closeWithoutSaving()
      return
    }

    const newId = uuid()
    const newComponent = {
      name: this.state.value,
      selectedNode: 'rootId',
      viewMode: ViewTypes.SingleCenter,
      root: {
        id: 'rootId',
        type: NodeTypes.Root,
        position: {
          top: 0,
          left: 0,
        },
        size: {
          width: 254,
          height: 254,
        },
        background: {
          color: '#49c67f',
        },
        children: [],
      },
    } as Component
    state.router.path = RouterPaths.component
    state.router.componentId = newId
    state.components[newId] = newComponent
    state.ui.addingComponent = false
  }

  render() {
    return (
      <ClickOutside onClickOutside={this.save}>
        <Input value={this.state.value} name="AddComponent" autoFocus={true} onChange={this.updateValue} />
      </ClickOutside>
    )
  }
}

export default view(AddComponent)
