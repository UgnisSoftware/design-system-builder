import * as React from 'react'
import styled from 'styled-components'

import TopBar from './TopBar/TopBar'
import Background from './Background/Background'
import stateUi from '@state/ui'

import AddMenuButton from '@src/editor/Elements/AddComponentMenu/AddMenuButton'
import AddComponentMenu from '@src/editor/Elements/AddComponentMenu/AddMenu'
import Component from '@src/interpreter/_Component'
import GridOverlay from '@src/editor/Elements/Overlay/Grid'
import { getSelectedElement, getSelectedModifier } from '@src/selector'
import ExporterMenu from '@src/editor/Elements/ExporterMenu/ExporterMenu'
import useKey from 'react-use/esm/useKey'
import { mergeElements } from '@src/utils'
import { deleteComponent, undoElement } from '@src/actions'
import Zoom from './Zoom/Zoom'
import { paths, pathToParams } from '@state/router'

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

const Elements = () => {
  const { componentId } = pathToParams(paths.element)

  useKey(deleteComponent)
  useKey(undoElement)

  const modifier = getSelectedModifier()
  const selectedElement = getSelectedElement()
  const element = !modifier ? selectedElement : mergeElements(selectedElement, selectedElement.modifiers[modifier])

  if (!element) {
    return (
      <Wrapper>
        <div />
        <Background>No Element with id {componentId} was found</Background>
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
