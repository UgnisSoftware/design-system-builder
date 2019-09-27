import * as React from 'react'
import styled from 'styled-components'

import TopBar from './TopBar/TopBar'
import Background from './Background/Background'
import stateUi from '@state/ui'

import { Emitter } from 'lape'
import { Data } from 'lape/dist/eventEmitter'

import AddMenuButton from '@src/editor/Elements/AddComponentMenu/AddMenuButton'
import AddComponentMenu from '@src/editor/Elements/AddComponentMenu/AddMenu'
import Component from '@src/interpreter/_Component'
import GridOverlay from '@src/editor/Elements/Overlay/Grid'
import { getSelectedElement, getSelectedModifier } from '@src/selector'
import ExporterMenu from '@src/editor/Elements/ExporterMenu/ExporterMenu'
import useSetState from 'react-use/esm/useSetState'
import useEffectOnce from 'react-use/esm/useEffectOnce'
import useKey from 'react-use/esm/useKey'
import { mergeElements } from '@src/utils'
import { deleteComponent } from '@src/actions'
import Zoom from './Zoom/Zoom'

const Wrapper = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: auto 1fr;
  perspective: 1000px;
`

const ElementWrapper = styled.div`
  transition: all 0.3s;
  width: 512px;
  position: relative;
  display: grid;
  flex: 1;
  transform: ${() =>
    `translateZ(0)  scale(${stateUi.zoom / 100}) ${stateUi.tilted ? `rotateY(30deg) rotateX(30deg)` : ''}`};
`

const Dimmer = styled.div`
  width: 512px;
  position: relative;
  display: grid;
  grid-template-columns: 512px;
  opacity: ${() => (stateUi.showGrid ? 0.3 : 1)};
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

      let reset = false
      let onlyUI = true
      data.forEach(entry => {
        if (entry.receiver === stateUi.router) {
          setState({ stack: [], index: 0 })
          reset = true
          return
        }
        if (
          entry.receiver !== stateUi &&
          entry.receiver !== stateUi.router &&
          entry.receiver !== stateUi.addingAtom
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

  useKey(deleteComponent)
  useKey(e => {
    if (!e.shiftKey && e.which === 90 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
      const mutations = localState.stack[localState.index]
      if (mutations) {
        localState.changingState = true

        mutations.forEach(data => {
          // ignore UI state
          if (data.receiver === stateUi || data.receiver === stateUi.router) {
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
          if (data.receiver == stateUi || data.receiver === stateUi.router) {
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

  const modifier = getSelectedModifier()
  const selectedElement = getSelectedElement()
  const element = !modifier ? selectedElement : mergeElements(selectedElement, selectedElement.modifiers[modifier])

  if (!element) {
    return (
      <Wrapper>
        <div />
        <Background>No Element with id {stateUi.router[1]} was found</Background>
      </Wrapper>
    )
  }

  if (!element.root) {
    return (
      <Wrapper>
        <div />
        <Background>New component TODO add root selection</Background>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <TopBar />
      <Background>
        <AddMenuButton />
        <ElementWrapper>
          <Dimmer>
            <Component component={element.root} tilted={stateUi.tilted} />
          </Dimmer>
          <GridOverlay rootNode={element.root} />
        </ElementWrapper>
        <AddComponentMenu />
        <ExporterMenu />
        {!stateUi.showAddComponentMenu && <Zoom />}
      </Background>
    </Wrapper>
  )
}
export default Elements
