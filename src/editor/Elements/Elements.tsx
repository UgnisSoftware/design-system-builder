import * as React from 'react'
import styled from 'styled-components'

import TopBar from '../TopBar/TopBar'
import Background from './Background/Background'
import state from '@state'

import { Emitter } from 'lape'
import { Data } from 'lape/dist/eventEmitter'

import AddComponentButton from '@src/editor/TopBar/AddComponentButton'
import AddComponentMenu from '@src/editor/Elements/AddComponentMenu/AddComponentMenu'
import AddingAtom from '@src/editor/Overlay/AddingAtom'
import Component from '@src/editor/Nodes/_Component'
import GridOverlay from '@src/editor/Overlay/Grid'
import { getSelectedElement } from '@src/selector'

const Wrapper = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: auto 1fr;
`

const ElementWrapper = styled.div`
  width: 512px;
  position: relative;
  display: grid;
  flex: 1;
`

const Dimmer = styled.div`
  width: 512px;
  position: relative;
  display: grid;
  grid-template-columns: 512px;
  opacity: ${() => (state.ui.showGrid ? 0.3 : 1)};
`

interface State {
  changingState: boolean
  disabled: boolean
  index: number
  stack: Map<object, Data>[]
}

class Elements extends React.Component<{}, State> {
  state = {
    changingState: false,
    disabled: true,
    index: 0,
    stack: [],
  }

  componentDidMount() {
    Emitter.addSet(data => {
      localStorage.setItem(
        'state',
        JSON.stringify({
          elements: state.elements,
          styles: state.styles,
        }),
      )
      if (this.state.changingState) {
        this.setState({ changingState: false })
        return
      }

      // I should have just used arrays...
      let reset = false
      let onlyUI = true
      data.forEach(entry => {
        if (entry.receiver === state.ui.router) {
          this.setState({ stack: [], index: 0 })
          reset = true
          return
        }
        if (
          entry.receiver !== state.ui &&
          entry.receiver !== state.ui.router &&
          entry.receiver !== state.ui.draggingNodePosition
        ) {
          onlyUI = false
        }
      })

      if (reset || onlyUI) {
        return
      }
      // delete redo stack if a new change came in
      if (this.state.index !== this.state.stack.length - 1) {
        this.state.stack.length = this.state.index + 1
      }
      this.state.stack.push(data)
      this.state.index = this.state.stack.length - 1
      this.setState({})
    })

    window.addEventListener('keydown', this.onKey)
  }

  onKey = e => {
    if (!e.shiftKey && e.which === 90 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
      this.goBack()
    }
    if (
      (e.which === 89 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) ||
      (e.shiftKey && e.which === 90 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey))
    ) {
      this.goForward()
    }
  }

  goBack = () => {
    const mutations = this.state.stack[this.state.index]
    if (mutations) {
      this.state.changingState = true

      mutations.forEach(data => {
        // ignore UI state
        if (data.receiver === state.ui || data.receiver === state.ui.router) {
          return
        }
        data.props.forEach(prop => {
          data.receiver[prop] = data.previous[prop]
        })
      })

      this.setState({ index: this.state.index - 1 })
    }
  }

  goForward = () => {
    const mutations = this.state.stack[this.state.index + 1]
    if (mutations) {
      this.state.changingState = true

      mutations.forEach(data => {
        // ignore UI state
        if (data.receiver == state.ui || data.receiver === state.ui.router) {
          return
        }
        data.props.forEach(prop => {
          data.receiver[prop] = data.next[prop]
        })
      })

      this.setState({ index: this.state.index + 1 })
    }
  }

  render() {
    const element = getSelectedElement()

    if (!element) {
      return (
        <Wrapper>
          <div />
          <Background>No Button with id {state.ui.router[1]} was found</Background>
        </Wrapper>
      )
    }

    return (
      <Wrapper>
        <TopBar />
        <Background>
          <AddComponentButton />
          <ElementWrapper>
            <Dimmer>
              <Component component={element.root} />
            </Dimmer>
            <GridOverlay rootNode={element.root} />
          </ElementWrapper>
          {state.ui.showAddComponentMenu && <AddComponentMenu />}
          {state.ui.addingAtom && <AddingAtom />}
        </Background>
      </Wrapper>
    )
  }
}
export default Elements
