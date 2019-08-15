import { parseUrl } from '@src/utils'
import { AnyEditableNodes, EditableNodes, ElementNode, Units } from '@src/interfaces/nodes'
import state from '@state'
import { getSelectedElement, getSelectedModifier } from '@src/selector'
import * as React from 'react'
import { AnyNodes } from '@src/interfaces/nodes'
import { DeepPartial } from '@src/interfaces/elements'

export const selectComponent = (component: EditableNodes, parent?: ElementNode) => e => {
  if (e.currentTarget === e.target) {
    const modifier = getSelectedModifier()

    state.ui.selectedNode = parent || component
    state.ui.selectedNodeToOverride = parent ? component : null

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

      const children = modifier ? getSelectedElement().modifiers[modifier].order : getSelectedElement().root.order
      const fromIndex = children.indexOf((parent && parent.id) || component.id)
      if (fromIndex !== -1) {
        children.splice(fromIndex, 1)
      }

      stopListening()
      dragComponent(parent || component)(e)
    }
    window.addEventListener('mousemove', drag)
    window.addEventListener('touchmove', drag)
    window.addEventListener('mouseup', stopListening)
    window.addEventListener('touchend', stopListening)
    function stopListening() {
      window.removeEventListener('mousemove', drag)
      window.removeEventListener('touchmove', drag)
      window.removeEventListener('mouseup', stopListening)
      window.removeEventListener('touchend', stopListening)
      return false
    }
    return false
  }
}

export const dragComponent = (component: EditableNodes) => (event: React.MouseEvent & React.TouchEvent) => {
  event.stopPropagation()
  const box = (event.target as HTMLDivElement).getBoundingClientRect()

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

    addComponent(component)
    window.removeEventListener('mousemove', drag)
    window.removeEventListener('touchmove', drag)
    window.removeEventListener('mouseup', stopDragging)
    window.removeEventListener('touchend', stopDragging)
    return false
  }
  return false
}

const addComponent = (component: EditableNodes) => {
  if (state.ui.hoveredCell) {
    const modifier = getSelectedModifier()
    const selectedElement = getSelectedElement()
    const order = modifier ? selectedElement.modifiers[modifier].order : selectedElement.root.order

    component.columnStart = state.ui.hoveredCell.colIndex + 1
    component.columnEnd = state.ui.hoveredCell.colIndex + 2
    component.rowStart = state.ui.hoveredCell.rowIndex + 1
    component.rowEnd = state.ui.hoveredCell.rowIndex + 2

    if (modifier) {
      const children = selectedElement.modifiers[modifier].children as { [key: string]: DeepPartial<AnyEditableNodes> }

      if (!children) {
        selectedElement.modifiers[modifier].children = {}
      }
      order.push(component.id)
      children[component.id] = component
    } else {
      const children = selectedElement.root.children as { [key: string]: EditableNodes }
      order.push(component.id)
      Object.values(selectedElement.modifiers).forEach(mod => mod.order.push(component.id))
      children[component.id] = component
    }

    state.ui.selectedNode = component
  }
  state.ui.addingAtom = null
  state.ui.hoveredCell = null
}

export const route = (path, componentId?, subComponentId?) => () => {
  state.ui.selectedNode = null
  state.ui.stateManager = null
  history.pushState(null, '', `/${[path, componentId, subComponentId].filter(Boolean).join('/')}`)
  state.ui.router = parseUrl()
}

export const changeProperty = <T extends keyof AnyEditableNodes>(propertyName: T, value: AnyNodes[T]) => {
  const stateManager = state.ui.stateManager
  const modifier = getSelectedModifier()
  const selectedElement = getSelectedElement()
  const selectedNode = state.ui.selectedNode
  if (modifier) {
    const children = selectedElement.modifiers[modifier].children as { [key: string]: DeepPartial<AnyEditableNodes> }

    if (!children) {
      selectedElement.modifiers[modifier].children = {}
    }
    if (!children[selectedNode.id]) {
      children[selectedNode.id] = stateManager
        ? {
            states: {
              [stateManager]: {
                [propertyName]: value,
              },
            },
          }
        : {
            [propertyName]: value,
          }
      return
    }
    if (stateManager) {
      children[selectedNode.id] = {
        ...children[selectedNode.id],
        states: {
          ...children[selectedNode.id].states,
          [stateManager]: {
            ...(children[selectedNode.id].states && children[selectedNode.id].states[stateManager]),
            [propertyName]: value,
          },
        },
      }
      return
    }
    children[selectedNode.id] = {
      ...children[selectedNode.id],
      [propertyName]: value,
    }
    return
  }
  const children = selectedElement.root.children as { [key: string]: AnyEditableNodes }
  if (stateManager) {
    children[selectedNode.id] = {
      ...children[selectedNode.id],
      states: {
        ...children[selectedNode.id].states,
        [stateManager]: {
          ...(children[selectedNode.id].states && children[selectedNode.id].states[stateManager]),
          [propertyName]: value,
        },
      },
    }
    return
  }
  children[selectedNode.id] = {
    ...children[selectedNode.id],
    [propertyName]: value,
  }
  return
}

export const moveLayer = (by: number) => () => {
  const node = state.ui.selectedNode.id
  const modifier = getSelectedModifier()
  const order = modifier ? getSelectedElement().modifiers[modifier].order : getSelectedElement().root.order
  const fromIndex = order.indexOf(node)
  const toIndex = fromIndex + by
  // out of bounds
  if (toIndex < 0 || toIndex > order.length) {
    return
  }
  order.splice(fromIndex, 1)
  order.splice(toIndex, 0, node)
}

export const deleteComponent = e => {
  const del = e.keyCode === 46
  const backspace = e.keyCode === 8
  const component = getSelectedElement()
  const modifier = getSelectedModifier()
  if ((del || backspace) && state.ui.selectedNode && !state.ui.editingTextNode) {
    const node = modifier ? component.modifiers[modifier] : component.root
    const nodeIndex = node.order.indexOf(state.ui.selectedNode.id)
    // delete in all modifiers too
    if (!modifier) {
      Object.values(component.modifiers).forEach(mod => {
        const nodeIndex = mod.order.indexOf(state.ui.selectedNode.id)
        if (nodeIndex > -1) {
          mod.order.splice(nodeIndex, 1)
        }
      })
    }
    node.order.splice(nodeIndex, 1)
    delete node.children[state.ui.selectedNode.id]
    state.ui.selectedNode = null
    state.ui.stateManager = null
  }
  return false
}

export const addColumn = () => {
  const element = getSelectedElement()
  const modifier = getSelectedModifier()

  if (modifier) {
    const columns = element.modifiers[modifier].columns

    if (!columns) {
      element.modifiers[modifier].columns = [
        ...element.root.columns,
        {
          value: 100,
          unit: Units.Px,
        },
      ]
    } else {
      columns.push({
        value: 100,
        unit: Units.Px,
      })
    }
  } else {
    element.root.columns.push({
      value: 100,
      unit: Units.Px,
    })
  }
}
export const addRow = () => {
  const element = getSelectedElement()
  const modifier = getSelectedModifier()

  if (modifier) {
    const rows = element.modifiers[modifier].rows

    if (!rows) {
      element.modifiers[modifier].rows = [
        ...element.root.rows,
        {
          value: 100,
          unit: Units.Px,
        },
      ]
    } else {
      rows.push({
        value: 100,
        unit: Units.Px,
      })
    }
  } else {
    element.root.rows.push({
      value: 100,
      unit: Units.Px,
    })
  }
}

export const changeColumnValue = (index: number) => e => {
  const element = getSelectedElement()
  const modifier = getSelectedModifier()

  if (modifier) {
    const columns = element.modifiers[modifier].columns

    if (!columns) {
      element.modifiers[modifier].columns = [...element.root.columns]
    }
    element.modifiers[modifier].columns[index].value = e.target.value
  } else {
    element.root.columns[index].value = e.target.value
  }
}
export const changeRowValue = (index: number) => e => {
  const element = getSelectedElement()
  const modifier = getSelectedModifier()

  if (modifier) {
    const rows = element.modifiers[modifier].rows

    if (!rows) {
      element.modifiers[modifier].rows = [...element.root.rows]
    }
    element.modifiers[modifier].rows[index].value = e.target.value
  } else {
    element.root.rows[index].value = e.target.value
  }
}

export const changeColumnUnits = (index: number) => e => {
  const element = getSelectedElement()
  const modifier = getSelectedModifier()

  if (modifier) {
    const columns = element.modifiers[modifier].columns

    if (!columns) {
      element.modifiers[modifier].columns = [...element.root.columns]
    }
    element.modifiers[modifier].columns[index].unit = e.target.value
  } else {
    element.root.columns[index].unit = e.target.value
  }
}
export const changeRowUnits = (index: number) => e => {
  const element = getSelectedElement()
  const modifier = getSelectedModifier()

  if (modifier) {
    const rows = element.modifiers[modifier].rows

    if (!rows) {
      element.modifiers[modifier].rows = [...element.root.rows]
    }
    element.modifiers[modifier].rows[index].unit = e.target.value
  } else {
    element.root.rows[index].unit = e.target.value
  }
}

export const deleteColumn = colIndex => () => {
  const element = getSelectedElement()
  const modifier = getSelectedModifier()

  if (modifier) {
    const columns = element.modifiers[modifier].columns

    if (!columns) {
      element.modifiers[modifier].columns = [...element.root.columns]
      element.modifiers[modifier].columns.splice(colIndex, 1)
    } else {
      columns.splice(colIndex, 1)
    }
  } else {
    element.root.columns.splice(colIndex, 1)
  }
}

export const deleteRow = rowIndex => () => {
  const element = getSelectedElement()
  const modifier = getSelectedModifier()

  if (modifier) {
    const rows = element.modifiers[modifier].rows

    if (!rows) {
      element.modifiers[modifier].rows = [...element.root.rows]
      element.modifiers[modifier].rows.splice(rowIndex, 1)
    } else {
      rows.splice(rowIndex, 1)
    }
  } else {
    element.root.rows.splice(rowIndex, 1)
  }
}
