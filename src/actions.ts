import { AnyEditableNodes, EditableNodes, ElementNode, Units } from '@src/interfaces/nodes'
import stateUi from '@state/ui'
import { getSelectedElement, getSelectedModifier } from '@src/selector'
import * as React from 'react'
import { AnyNodes } from '@src/interfaces/nodes'
import { DeepPartial } from '@src/interfaces/elements'
import { recordUndo, redo, undo } from 'lape'
import { paths, pathToParams } from '@state/router'

export const selectComponent = (component: EditableNodes, parent?: ElementNode) => (e) => {
  if (e.currentTarget === e.target) {
    stateUi.selectedNode = parent || component
    stateUi.selectedNodeToOverride = parent ? component : null

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

      stopListening()
      dragComponent(parent || component, parent)(e)
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

export const dragComponent = (component: EditableNodes, parent?: ElementNode) => (
  event: React.MouseEvent & React.TouchEvent,
) => {
  const box = (event.target as HTMLDivElement).getBoundingClientRect()
  let currentX = event.touches ? event.touches[0].pageX : event.pageX
  let currentY = event.touches ? event.touches[0].pageY : event.pageY

  stateUi.showAddComponentMenu = false
  stateUi.addingAtom = {
    node: component,
    x: currentX,
    y: currentY,
    width: box.width,
    height: box.height,
  }

  function drag(e) {
    e.preventDefault()
    const newX = e.touches ? e.touches[0].pageX : e.pageX
    const newY = e.touches ? e.touches[0].pageY : e.pageY
    stateUi.addingAtom.x = newX
    stateUi.addingAtom.y = newY
    return false
  }
  window.addEventListener('mousemove', drag)
  window.addEventListener('touchmove', drag)
  window.addEventListener('mouseup', stopDragging)
  window.addEventListener('touchend', stopDragging)
  function stopDragging(event) {
    event.preventDefault()
    const modifier = getSelectedModifier()

    const children = modifier ? getSelectedElement().modifiers[modifier].order : getSelectedElement().root.order
    const fromIndex = children.indexOf((parent && parent.id) || component.id)
    if (fromIndex !== -1) {
      children.splice(fromIndex, 1)
    }

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
  const { componentId } = pathToParams(paths.element)

  recordUndo(() => {
    if (stateUi.hoveredCell) {
      const modifier = getSelectedModifier()
      const selectedElement = getSelectedElement()
      const order = modifier ? selectedElement.modifiers[modifier].order : selectedElement.root.order

      component.columnStart = stateUi.hoveredCell.colIndex + 1
      component.columnEnd = stateUi.hoveredCell.colIndex + 2
      component.rowStart = stateUi.hoveredCell.rowIndex + 1
      component.rowEnd = stateUi.hoveredCell.rowIndex + 2

      if (modifier) {
        const children = selectedElement.modifiers[modifier].children

        if (!children) {
          selectedElement.modifiers[modifier].children = {}
        }
        order.push(component.id)
        children[component.id] = component
      } else {
        const children = selectedElement.root.children as { [key: string]: EditableNodes }
        order.push(component.id)
        Object.values(selectedElement.modifiers).forEach((mod) => mod.order.push(component.id))
        children[component.id] = component
      }

      stateUi.selectedNode = component
    }
    stateUi.addingAtom = null
    stateUi.hoveredCell = null
  }, componentId)
}

export const changeProperty = <T extends keyof AnyEditableNodes>(propertyName: T, value: AnyNodes[T]) => {
  const { componentId } = pathToParams(paths.element)
  const stateManager = stateUi.stateManager
  const modifier = getSelectedModifier()
  const selectedElement = getSelectedElement()
  const selectedNode = stateUi.selectedNode


  console.log(propertyName, value)
  recordUndo(() => {
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
  }, componentId)
}

export const moveLayer = (by: number) => () => {
  const { componentId } = pathToParams(paths.element)
  const node = stateUi.selectedNode.id
  const modifier = getSelectedModifier()
  const order = modifier ? getSelectedElement().modifiers[modifier].order : getSelectedElement().root.order
  const fromIndex = order.indexOf(node)
  const toIndex = fromIndex + by
  // out of bounds
  if (toIndex < 0 || toIndex > order.length) {
    return
  }
  recordUndo(() => {
    order.splice(fromIndex, 1)
    order.splice(toIndex, 0, node)
  }, componentId)
}

export const deleteComponent = (e) => {
  const { componentId } = pathToParams(paths.element)
  const del = e.keyCode === 46
  const backspace = e.keyCode === 8
  const component = getSelectedElement()
  const modifier = getSelectedModifier()
  if ((del || backspace) && stateUi.selectedNode && !stateUi.editingTextNode) {
    const node = modifier ? component.modifiers[modifier] : component.root
    const nodeIndex = node.order.indexOf(stateUi.selectedNode.id)
    recordUndo(() => {
      // delete in all modifiers too
      if (!modifier) {
        Object.values(component.modifiers).forEach((mod) => {
          const nodeIndex = mod.order.indexOf(stateUi.selectedNode.id)
          if (nodeIndex > -1) {
            mod.order.splice(nodeIndex, 1)
          }
        })
      }
      node.order.splice(nodeIndex, 1)
      delete node.children[stateUi.selectedNode.id]
    }, componentId)
    stateUi.selectedNode = null
    stateUi.stateManager = null
  }
  return false
}

export const undoElement = (e) => {
  const { componentId } = pathToParams(paths.element)

  if (!e.shiftKey && e.which === 90 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
    e.preventDefault()
    undo(componentId)
  }
  if (
    (e.which === 89 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) ||
    (e.shiftKey && e.which === 90 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey))
  ) {
    e.preventDefault()
    redo(componentId)
  }
  return false
}

export const addColumn = () => {
  const { componentId } = pathToParams(paths.element)
  const element = getSelectedElement()
  const modifier = getSelectedModifier()

  recordUndo(() => {
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
  }, componentId)
}
export const addRow = () => {
  const { componentId } = pathToParams(paths.element)
  const element = getSelectedElement()
  const modifier = getSelectedModifier()

  recordUndo(() => {
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
  }, componentId)
}

export const changeColumnValue = (index: number) => (e) => {
  const { componentId } = pathToParams(paths.element)
  const element = getSelectedElement()
  const modifier = getSelectedModifier()

  recordUndo(() => {
    if (modifier) {
      const columns = element.modifiers[modifier].columns

      if (!columns) {
        element.modifiers[modifier].columns = [...element.root.columns]
      }
      element.modifiers[modifier].columns[index].value = e.target.value
    } else {
      element.root.columns[index].value = e.target.value
    }
  }, componentId)
}
export const changeRowValue = (index: number) => (e) => {
  const { componentId } = pathToParams(paths.element)
  const element = getSelectedElement()
  const modifier = getSelectedModifier()

  recordUndo(() => {
    if (modifier) {
      const rows = element.modifiers[modifier].rows

      if (!rows) {
        element.modifiers[modifier].rows = [...element.root.rows]
      }
      element.modifiers[modifier].rows[index].value = e.target.value
    } else {
      element.root.rows[index].value = e.target.value
    }
  }, componentId)
}

export const changeColumnUnits = (index: number) => (e) => {
  const { componentId } = pathToParams(paths.element)
  const element = getSelectedElement()
  const modifier = getSelectedModifier()

  recordUndo(() => {
    if (modifier) {
      const columns = element.modifiers[modifier].columns

      if (!columns) {
        element.modifiers[modifier].columns = [...element.root.columns]
      }
      element.modifiers[modifier].columns[index].unit = e.target.value
    } else {
      element.root.columns[index].unit = e.target.value
    }
  }, componentId)
}
export const changeRowUnits = (index: number) => (e) => {
  const { componentId } = pathToParams(paths.element)
  const element = getSelectedElement()
  const modifier = getSelectedModifier()

  recordUndo(() => {
    if (modifier) {
      const rows = element.modifiers[modifier].rows

      if (!rows) {
        element.modifiers[modifier].rows = [...element.root.rows]
      }
      element.modifiers[modifier].rows[index].unit = e.target.value
    } else {
      element.root.rows[index].unit = e.target.value
    }
  }, componentId)
}

export const deleteColumn = (colIndex) => () => {
  const { componentId } = pathToParams(paths.element)
  const element = getSelectedElement()
  const modifier = getSelectedModifier()

  recordUndo(() => {
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
  }, componentId)
}

export const deleteRow = (rowIndex) => () => {
  const { componentId } = pathToParams(paths.element)
  const element = getSelectedElement()
  const modifier = getSelectedModifier()

  recordUndo(() => {
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
  }, componentId)
}
