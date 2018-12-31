import * as React from 'react'
import styled from 'styled-components'
import state from '@state'
import AddComponentMenu from './AddComponentMenu/AddComponentMenu'
import Component from '@src/editor/Center/Preview/ComponentView/_Component'
import { connect } from 'lape'
import { ComponentView, Node } from '@src/interfaces'

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex: 1;
`

const PreviewBox = styled.div`
  flex: 1;
  background: radial-gradient(#f7f7f7 15%, transparent 16%) 0 0, radial-gradient(#ececec 15%, transparent 16%) 8px 8px,
    radial-gradient(rgba(255, 255, 255, 0.1) 15%, transparent 20%) 0 1px,
    radial-gradient(rgba(255, 255, 255, 0.1) 15%, transparent 20%) 8px 9px;
  background-color: rgb(0, 0, 0, 0.01);
  background-size: 16px 16px;
  display: flex;
  filter: ${() => (state.ui.showAddComponentMenu ? 'blur(10px) saturate(0.8)' : 'none')};
  overflow: hidden;
  perspective: 1000px;
`

const ScaleBox = styled.div`
  transform: ${() => `translateZ(0) scale(${state.ui.zoom / 100})`};
`
const PerspectiveBox = styled.div`
  position: relative;
  transition: transform 0.3s;
  transform: ${() => (state.ui.componentView === ComponentView.Tilted ? `rotateY(30deg) rotateX(30deg)` : 'none')};
`

const PositionBox = styled.div`
  position: absolute;
  top: ${() => state.ui.screenPosition.y}px;
  left: ${() => state.ui.screenPosition.x}px;
`

const previewClick = e => {
  if (e.target !== e.currentTarget) {
    return
  }
  state.ui.selectedNode = {} as Node
  e.preventDefault()
  let currentX = e.touches ? e.touches[0].pageX : e.pageX
  let currentY = e.touches ? e.touches[0].pageY : e.pageY
  let initialX = state.ui.screenPosition.x
  let initialY = state.ui.screenPosition.y
  function drag(e) {
    e.preventDefault()
    const newX = e.touches ? e.touches[0].pageX : e.pageX
    const newY = e.touches ? e.touches[0].pageY : e.pageY
    const diffX = currentX - newX
    const diffY = currentY - newY
    state.ui.screenPosition.x = initialX - diffX
    state.ui.screenPosition.y = initialY - diffY
    return false
  }
  console.log('kay')
  window.addEventListener('mousemove', drag)
  window.addEventListener('touchmove', drag)
  window.addEventListener('mouseup', stopDragging)
  window.addEventListener('touchend', stopDragging)
  function stopDragging(event) {
    console.log('wat')
    event.preventDefault()
    window.removeEventListener('mousemove', drag)
    window.removeEventListener('touchmove', drag)
    window.removeEventListener('mouseup', stopDragging)
    window.removeEventListener('touchend', stopDragging)
    return false
  }
  return false
}

const Preview = () => {
  const component = state.components[state.router.componentId]
  return (
    <Wrapper>
      <PreviewBox onMouseDown={previewClick}>
        <ScaleBox>
          <PerspectiveBox>
            <PositionBox>
              {component.nodes.map(node => (
                <Component component={node} />
              ))}
            </PositionBox>
          </PerspectiveBox>
        </ScaleBox>
      </PreviewBox>
      {state.ui.showAddComponentMenu && <AddComponentMenu />}
    </Wrapper>
  )
}

export default connect(Preview)
