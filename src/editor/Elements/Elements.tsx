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
import ShowExportButton from '@src/editor/TopBar/ShowExportButton'
import ExporterMenu from '@src/editor/Elements/ExporterMenu/ExporterMenu'
import useSetState from 'react-use/esm/useSetState'
import useEffectOnce from 'react-use/esm/useEffectOnce'
import useKey from 'react-use/esm/useKey'

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

const Elements = () => {
  const [localState, setState] = useSetState<State>({
    changingState: false,
    disabled: true,
    index: 0,
    stack: [],
  })

  useEffectOnce(() => {
    Emitter.addSet(data => {
      if (localState.changingState) {
        setState({ changingState: false })
        return
      }

      // I should have just used arrays...
      let reset = false
      let onlyUI = true
      data.forEach(entry => {
        if (entry.receiver === state.ui.router) {
          setState({ stack: [], index: 0 })
          reset = true
          return
        }
        if (
          entry.receiver !== state.ui &&
          entry.receiver !== state.ui.router &&
          entry.receiver !== state.ui.addingAtom
        ) {
          onlyUI = false
        }
      })

      if (reset || onlyUI) {
        return
      }
      // delete redo stack if a new change came in
      if (localState.index !== localState.stack.length - 1) {
        localState.stack.length = localState.index + 1
      }
      localState.stack.push(data)
      localState.index = localState.stack.length - 1
      setState({})
    })
  })

  useKey(e => {
    if (!e.shiftKey && e.which === 90 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
      const mutations = localState.stack[localState.index]
      if (mutations) {
        localState.changingState = true

        mutations.forEach(data => {
          // ignore UI state
          if (data.receiver === state.ui || data.receiver === state.ui.router) {
            return
          }
          data.props.forEach(prop => {
            data.receiver[prop] = data.previous[prop]
          })
        })

        setState({ index: localState.index - 1 })
      }
    }
    if (
      (e.which === 89 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) ||
      (e.shiftKey && e.which === 90 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey))
    ) {
      const mutations = localState.stack[localState.index + 1]
      if (mutations) {
        localState.changingState = true

        mutations.forEach(data => {
          // ignore UI state
          if (data.receiver == state.ui || data.receiver === state.ui.router) {
            return
          }
          data.props.forEach(prop => {
            data.receiver[prop] = data.next[prop]
          })
        })

        setState({ index: localState.index + 1 })
      }
    }
    return false
  })

  const element = getSelectedElement()

  if (!element) {
    return (
      <Wrapper>
        <div />
        <Background>No Element with id {state.ui.router[1]} was found</Background>
      </Wrapper>
    )
  }

  if (!element.root) {
    return (
      <Wrapper>
        <div />
        <Background>Hello</Background>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <TopBar />
      <Background>
        <AddComponentButton />
        <ShowExportButton />
        <ElementWrapper>
          <Dimmer>
            <Component component={element.root} />
          </Dimmer>
          <GridOverlay rootNode={element.root} />
        </ElementWrapper>
        <AddComponentMenu />
        <ExporterMenu />
        {state.ui.addingAtom && <AddingAtom />}
      </Background>
    </Wrapper>
  )
}
export default Elements
