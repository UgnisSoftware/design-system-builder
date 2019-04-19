import * as React from 'react'
import styled, { css } from 'styled-components'
import { Nodes, RootNode } from '@src/Interfaces/nodes'
import { Colors } from '@src/styles'
import state from '@state'
import { DragDirection } from '@src/Interfaces/ui'

interface BorderProps {
  col: number
  row: number
  selected?: boolean
}

const BorderTop = styled.div`
  grid-column: ${({ col }: BorderProps) => `${col} / ${col + 1}`};
  grid-row: 1 / 2;
  border: ${Colors.grey200} dashed 1px;
  user-select: none;
  background: ${Colors.grey100};
  border-radius: 4px;
`

const BorderLeft = styled.div`
  grid-column: 1 / 2;
  grid-row: ${({ row }: BorderProps) => `${row} / ${row + 1}`};
  border: ${Colors.grey200} dashed 1px;
  user-select: none;
  background: ${Colors.grey100};
  border-radius: 4px;
`

interface Props {
  rootNode: RootNode
}
interface SelectedProps {
  node: Nodes
}

const GridTop = styled.div`
  position: absolute;
  width: calc(100% - 70px);
  left: 70px;
  top: 0px;
  display: grid;
  grid-template-columns: ${({ rootNode }: Props) => rootNode.columns.map(col => col.value + col.unit).join(' ')};
  grid-template-rows: 20px;
`
const GridLeft = styled.div`
  position: absolute;
  width: 20px;
  height: calc(100% - 70px);
  left: 0px;
  top: 70px;
  display: grid;
  grid-template-columns: 20px;
  grid-template-rows: ${({ rootNode }: Props) => rootNode.rows.map(col => col.value + col.unit).join(' ')};
`

const Border = styled.div`
  grid-column: ${({ col }: BorderProps) => `${col} / ${col + 1}`};
  grid-row: ${({ row }: BorderProps) => `${row} / ${row + 1}`};
  background: ${({ selected }: BorderProps) => (selected ? `rgba(0,0,0,.25)` : 'none')};
  border: #565656 dashed 1px;
`

const BorderForSelected = styled.div`
  position: relative;
  grid-column: ${({ node }: SelectedProps) => `${node.position.columnStart} / ${node.position.columnEnd}`};
  grid-row: ${({ node }: SelectedProps) => `${node.position.rowStart} / ${node.position.rowEnd}`};
`

const GridWrapper = styled.div`
  position: absolute;
  left: 70px;
  top: 70px;
  right: 0;
  bottom: 0;
`

const Grid = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0px;
  top: 0px;
  display: grid;
  grid-template-columns: ${({ rootNode }: Props) => rootNode.columns.map(col => col.value + col.unit).join(' ')};
  grid-template-rows: ${({ rootNode }: Props) => rootNode.rows.map(col => col.value + col.unit).join(' ')};
`

const GridOverlayWrapper = styled.div`
  ${({ visible }: { visible: boolean }) =>
    !visible
      ? css`
          pointer-events: none;
          user-select: none;
        `
      : ''};
  position: absolute;
  left: -70px;
  top: -70px;
  width: calc(100% + 70px);
  height: calc(100% + 70px);
`

const drag = (node: Nodes, parent: RootNode, direction: DragDirection) => e => {
  e.stopPropagation()
  e.preventDefault()
  state.ui.expandingNode = {
    node,
    parent,
    direction,
  }

  function stopDragging(event) {
    state.ui.expandingNode = null
    event.preventDefault()
    window.removeEventListener('mouseup', stopDragging)
    window.removeEventListener('touchend', stopDragging)
  }
  window.addEventListener('mouseup', stopDragging)
  window.addEventListener('touchend', stopDragging)
}

const SideDrag = styled.div`
  pointer-events: all;
  position: absolute;
  transition: all 0.3s;
`

const TopDrag = styled(SideDrag)`
  top: -12px;
  left: 0px;
  height: 12px;
  right: 0px;
  cursor: n-resize;
  border-bottom: #565656 dashed 1px;
`
const BottomDrag = styled(SideDrag)`
  bottom: -12px;
  left: 0px;
  height: 12px;
  right: 0px;
  cursor: s-resize;
  border-top: #565656 dashed 1px;
`
const LeftDrag = styled(SideDrag)`
  top: 0px;
  left: -12px;
  width: 12px;
  bottom: 0px;
  cursor: w-resize;
  border-right: #565656 dashed 1px;
`
const RightDrag = styled(SideDrag)`
  top: 0px;
  right: -12px;
  width: 12px;
  bottom: 0px;
  cursor: e-resize;
  border-left: #565656 dashed 1px;
`

const CornerDrag = styled.div`
  pointer-events: all;
  position: absolute;
  transition: all 0.3s;
  width: 8px;
  height: 8px;
  background: ${Colors.accent};
`
const TopLeftDrag = styled(CornerDrag)`
  top: -4px;
  left: -4px;
  cursor: nw-resize;
`
const TopRightDrag = styled(CornerDrag)`
  top: -4px;
  right: -4px;
  cursor: ne-resize;
`

const BottomLeftDrag = styled(CornerDrag)`
  bottom: -4px;
  left: -4px;
  cursor: sw-resize;
`
const BottomRightDrag = styled(CornerDrag)`
  bottom: -4px;
  right: -4px;
  cursor: se-resize;
`

interface Props {
  rootNode: RootNode
}

const onMouseOver = (rootNode: RootNode, rowIndex: number, colIndex: number) => () => {
  if (state.ui.addingAtom || state.ui.draggingNodePosition) {
    state.ui.hoveredCell = {
      component: rootNode,
      rowIndex,
      colIndex,
    }
  }
}

const FullGrid = ({ rootNode }: Props) => (
  <>
    {rootNode.rows.map((_, rowIndex) =>
      rootNode.columns.map((_, colIndex) => (
        <Border
          key={`${colIndex}_${rowIndex}`}
          row={rowIndex + 1}
          col={colIndex + 1}
          selected={
            state.ui.hoveredCell &&
            (state.ui.hoveredCell.component === rootNode &&
              state.ui.hoveredCell.colIndex === colIndex &&
              state.ui.hoveredCell.rowIndex === rowIndex)
          }
          onMouseOver={onMouseOver(rootNode, rowIndex, colIndex)}
        />
      )),
    )}
  </>
)

/*
 * This Component is responsible for:
 *   Changing grid size  -- SHOW GRID
 *   Adding/removing columns/rows  -- SHOW GRID | COLUMN/ROW SELECTED
 *   Dropping other components into correct places -- ADDING ATOM
 *   Resizing components -- state.ui.expandingNode
 *   Editing text - state.ui.editingTextNode
 */
const GridOverlay = ({ rootNode }: Props) => (
  <GridOverlayWrapper visible={state.ui.addingAtom || state.ui.draggingNodePosition}>
    {state.ui.showGrid && (
      <>
        <GridTop rootNode={rootNode}>
          {rootNode.columns.map((_, colIndex) => (
            <BorderTop key={`col_${colIndex}`} col={colIndex + 1} />
          ))}
        </GridTop>
        <GridLeft rootNode={rootNode}>
          {rootNode.rows.map((_, rowIndex) => (
            <BorderLeft key={`row_${rowIndex}`} row={rowIndex + 1} />
          ))}
        </GridLeft>
      </>
    )}
    <GridWrapper>
      <Grid rootNode={rootNode}>
        {(state.ui.showGrid || state.ui.addingAtom || state.ui.draggingNodePosition) && (
          <FullGrid rootNode={rootNode} />
        )}
        {!(state.ui.addingAtom || state.ui.draggingNodePosition) && rootNode.children.includes(state.ui.selectedNode) && (
          <BorderForSelected node={state.ui.selectedNode}>
            <TopDrag onMouseDown={drag(state.ui.selectedNode, rootNode, DragDirection.N)} />
            <LeftDrag onMouseDown={drag(state.ui.selectedNode, rootNode, DragDirection.W)} />
            <RightDrag onMouseDown={drag(state.ui.selectedNode, rootNode, DragDirection.E)} />
            <BottomDrag onMouseDown={drag(state.ui.selectedNode, rootNode, DragDirection.S)} />
            <TopLeftDrag onMouseDown={drag(state.ui.selectedNode, rootNode, DragDirection.NW)} />
            <TopRightDrag onMouseDown={drag(state.ui.selectedNode, rootNode, DragDirection.NE)} />
            <BottomLeftDrag onMouseDown={drag(state.ui.selectedNode, rootNode, DragDirection.SW)} />
            <BottomRightDrag onMouseDown={drag(state.ui.selectedNode, rootNode, DragDirection.SE)} />
          </BorderForSelected>
        )}
      </Grid>
    </GridWrapper>
  </GridOverlayWrapper>
)

export default GridOverlay
