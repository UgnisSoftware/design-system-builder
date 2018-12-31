import * as React from 'react'
import styled from 'styled-components'
import state from '@state'
import { connect } from 'lape'
import { Node } from '@src/interfaces'

const Background = styled.div`
  position: absolute;
  top: -16px;
  bottom: -16px;
  left: -16px;
  right: -16px;
  background: radial-gradient(#f7f7f7 15%, transparent 16%) 0 0, radial-gradient(#ececec 15%, transparent 16%) 8px 8px,
    radial-gradient(rgba(255, 255, 255, 0.1) 15%, transparent 20%) 0 1px,
    radial-gradient(rgba(255, 255, 255, 0.1) 15%, transparent 20%) 8px 9px;
  background-color: rgb(0, 0, 0, 0.01);
  background-size: 16px 16px;
  transform: ${() => `translateZ(0) scale(${state.ui.zoom / 100})`};
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
  window.addEventListener('mousemove', drag)
  window.addEventListener('touchmove', drag)
  window.addEventListener('mouseup', stopDragging)
  window.addEventListener('touchend', stopDragging)
  function stopDragging(event) {
    event.preventDefault()
    window.removeEventListener('mousemove', drag)
    window.removeEventListener('touchmove', drag)
    window.removeEventListener('mouseup', stopDragging)
    window.removeEventListener('touchend', stopDragging)
    return false
  }
  return false
}

const BackgroundComponent = () => {
  return (
    <Background
      style={{
        transform: `translateX(${state.ui.screenPosition.x % 16}px) translateY(${state.ui.screenPosition.y % 16}px)`,
      }}
      onMouseDown={previewClick}
    />
  )
}

export default connect(BackgroundComponent)
