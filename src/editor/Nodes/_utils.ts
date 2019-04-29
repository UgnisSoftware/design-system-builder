import { ElementNode, Nodes, NodeTypes } from '@src/interfaces/nodes'
import state from '@state'

export const selectComponent = (component: Nodes, parent?: ElementNode) => e => {
  e.preventDefault()
  if (e.currentTarget === e.target) {
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

      if (!state.ui.draggingNodePosition) {
        // don't drag immediately
        if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10) {
          return
        }
        state.ui.draggingNodePosition = {
          x: 0,
          y: 0,
        }
      }
      state.ui.draggingNodePosition.y -= diffY
      state.ui.draggingNodePosition.x -= diffX
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
      state.ui.draggingNodePosition = null
      if (state.ui.hoveredCell) {
        if (parent) {
          parent.position = {
            columnStart: state.ui.hoveredCell.colIndex + 1,
            columnEnd:
              state.ui.hoveredCell.colIndex + 1 + component.position.columnEnd - component.position.columnStart,
            rowStart: state.ui.hoveredCell.rowIndex + 1,
            rowEnd: state.ui.hoveredCell.rowIndex + 1 + component.position.rowEnd - component.position.rowStart,
          }
        } else if (component.type !== NodeTypes.Root) {
          component.position = {
            columnStart: state.ui.hoveredCell.colIndex + 1,
            columnEnd:
              state.ui.hoveredCell.colIndex + 1 + component.position.columnEnd - component.position.columnStart,
            rowStart: state.ui.hoveredCell.rowIndex + 1,
            rowEnd: state.ui.hoveredCell.rowIndex + 1 + component.position.rowEnd - component.position.rowStart,
          }
        }
        state.ui.hoveredCell = null
      }
      window.removeEventListener('mousemove', drag)
      window.removeEventListener('touchmove', drag)
      window.removeEventListener('mouseup', stopDragging)
      window.removeEventListener('touchend', stopDragging)
      return false
    }
    return false
  }
}
