import { parseUrl } from '@src/utils'
import { ElementNode, Nodes, NodeTypes } from '@src/interfaces/nodes'
import state from '@state'
import { getSelectedElement } from '@src/selector'
import * as React from 'react'

export const selectComponent = (component: Nodes, parent?: ElementNode) => e => {
  if (e.currentTarget === e.target) {
    state.ui.selectedNode = parent || component
    state.ui.selectedNodeToOverride = parent ? component : null

    if (component.type === NodeTypes.Root && !parent) {
      return
    }

    let currentX = e.touches ? e.touches[0].pageX : e.pageX
    let currentY = e.touches ? e.touches[0].pageY : e.pageY
    function drag(e) {
      e.preventDefault()
      const newX = e.touches ? e.touches[0].pageX : e.pageX
      const newY = e.touches ? e.touches[0].pageY : e.pageY
      const diffX = currentX - newX
      const diffY = currentY - newY

      if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10) {
        return
      }

      const children = getSelectedElement().root.children
      const fromIndex = children.indexOf(parent || component)
      if (fromIndex !== -1) {
        children.splice(fromIndex, 1)
      }

      addComponent(parent || component)(e)

      window.removeEventListener('mousemove', drag)
      window.removeEventListener('touchmove', drag)
      window.removeEventListener('mouseup', stopDragging)
      window.removeEventListener('touchend', stopDragging)
    }
    window.addEventListener('mousemove', drag)
    window.addEventListener('touchmove', drag)
    window.addEventListener('mouseup', stopDragging)
    window.addEventListener('touchend', stopDragging)
    function stopDragging() {
      window.removeEventListener('mousemove', drag)
      window.removeEventListener('touchmove', drag)
      window.removeEventListener('mouseup', stopDragging)
      window.removeEventListener('touchend', stopDragging)
      return false
    }
    return false
  }
}

export const addComponent = (component: Nodes) => (event: React.MouseEvent & React.TouchEvent) => {
  event.stopPropagation()
  const box = (event.target as HTMLDivElement).getBoundingClientRect()

  // state.components[state.ui.router.componentId].nodes.push(newNode)
  let currentX = event.touches ? event.touches[0].pageX : event.pageX
  let currentY = event.touches ? event.touches[0].pageY : event.pageY

  state.ui.showAddComponentMenu = false
  state.ui.addingAtom = {
    node: component,
    x: currentX - 200 - (currentX - box.left),
    y: currentY - 64 - (currentY - box.top),
  }

  function drag(e) {
    e.preventDefault()
    const newX = e.touches ? e.touches[0].pageX : e.pageX
    const newY = e.touches ? e.touches[0].pageY : e.pageY
    const diffX = currentX - newX
    const diffY = currentY - newY
    state.ui.addingAtom.y -= diffY
    state.ui.addingAtom.x -= diffX
    currentX = newX
    currentY = newY
    return false
  }
  window.addEventListener('mousemove', drag)
  window.addEventListener('touchmove', drag)
  window.addEventListener('mouseup', stopDragging)
  window.addEventListener('touchend', stopDragging)
  function stopDragging(event) {
    event.preventDefault()

    if (state.ui.hoveredCell) {
      component.position = {
        columnStart: state.ui.hoveredCell.colIndex + 1,
        columnEnd: state.ui.hoveredCell.colIndex + 2,
        rowStart: state.ui.hoveredCell.rowIndex + 1,
        rowEnd: state.ui.hoveredCell.rowIndex + 2,
      }
      state.ui.hoveredCell.component.children.push(component)
      state.ui.selectedNode = component
    }
    state.ui.addingAtom = null
    state.ui.hoveredCell = null
    window.removeEventListener('mousemove', drag)
    window.removeEventListener('touchmove', drag)
    window.removeEventListener('mouseup', stopDragging)
    window.removeEventListener('touchend', stopDragging)
    return false
  }
  return false
}

export const route = (path, componentId?) => () => {
  state.ui.selectedNode = null
  state.ui.stateManager = null
  history.pushState(null, '', componentId ? `/${path}/${componentId}` : `/${path}`)
  state.ui.router = parseUrl()
}
