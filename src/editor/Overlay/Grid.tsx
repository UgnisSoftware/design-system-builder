import * as React from 'react'
import styled, { css } from 'styled-components'
import { Nodes, RootNode, Units } from '@src/interfaces/nodes'
import { Colors } from '@src/styles'
import state from '@state'
import { DragDirection } from '@src/interfaces/ui'
import {
  addColumn,
  addRow,
  changeColumnUnits,
  changeColumnValue,
  changeRowUnits,
  changeRowValue,
  deleteColumn,
  deleteRow,
} from '@src/actions'

interface BorderProps {
  col: number
  row: number
  selected?: boolean
}

const BorderTop = styled.div`
  position: relative;
  grid-column: ${({ col }: BorderProps) => `${col} / ${col + 1}`};
  grid-row: 1 / 2;
  border: ${Colors.grey200} dashed 1px;
  user-select: none;
  background: ${({ selected }) => (selected ? Colors.grey200 : Colors.grey100)};
  border-radius: 4px;
`

const BorderLeft = styled.div`
  position: relative;
  grid-column: 1 / 2;
  grid-row: ${({ row }: BorderProps) => `${row} / ${row + 1}`};
  border: ${Colors.grey200} dashed 1px;
  user-select: none;
  background: ${({ selected }) => (selected ? Colors.grey200 : Colors.grey100)};
  border-radius: 4px;
`

const TopText = styled.div`
  position: absolute;
  top: -30px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
`

const LeftText = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 30px;
  display: flex;
  align-items: center;
`

const Input = styled.input`
  outline: none;
  border-radius: 4px;
  border: 1px solid ${Colors.grey200};
`

interface Props {
  rootNode: RootNode
}
interface SelectedProps {
  node: Nodes
}

const GridTop = styled.div`
  position: absolute;
  width: 100%;
  left: 0px;
  top: -70px;
  display: grid;
  justify-content: center;
  grid-template-columns: ${({ rootNode }: Props) => rootNode.columns.map(col => col.value + col.unit).join(' ')};
  grid-template-rows: 20px;
`
const GridLeft = styled.div`
  position: absolute;
  width: 20px;
  height: 100%;
  left: -70px;
  top: 0px;
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
  grid-column: ${({ node }: SelectedProps) => `${node.columnStart} / ${node.columnEnd}`};
  grid-row: ${({ node }: SelectedProps) => `${node.rowStart} / ${node.rowEnd}`};
`

const GridWrapper = styled.div`
  position: absolute;
  left: 0;
  top: 0;
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
  justify-content: center;
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
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
`

const drag = (node: Nodes, parent: RootNode, direction: DragDirection) => e => {
  e.stopPropagation()
  e.preventDefault()

  if (node === parent) {
    return
  }

  state.ui.expandingNode = {
    node,
    parent,
    direction,
  }

  function stopDragging(event) {
    state.ui.expandingNode = null
    state.ui.hoveredCell = null
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

const StylelessButton = styled.button.attrs({ type: 'button' })`
  background: none;
  color: inherit;
  border: none;
  padding: 0;
  cursor: pointer;
  outline: inherit;
`

const AddColumnButton = styled(StylelessButton)`
  position: absolute;
  top: -76px;
  right: -40px;
  border: 1px solid ${Colors.grey500};
  border-radius: 50%;
  width: 32px;
  height: 32px;
  background: ${Colors.grey100};
  font-size: 28px;
`
const AddRowButton = styled(StylelessButton)`
  position: absolute;
  bottom: -40px;
  left: -76px;
  border: 1px solid ${Colors.grey500};
  border-radius: 50%;
  width: 32px;
  height: 32px;
  background: ${Colors.grey100};
  font-size: 28px;
`
const DeleteRowButton = styled(StylelessButton)`
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto;
  right: -40px;
  border: 1px solid ${Colors.grey500};
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${Colors.grey100};
  font-size: 18px;
`
const DeleteColumnButton = styled(StylelessButton)`
  position: absolute;
  bottom: -40px;
  left: 0px;
  right: 0px;
  margin: auto;
  border: 1px solid ${Colors.grey500};
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${Colors.grey100};
  font-size: 18px;
`

interface Props {
  rootNode: RootNode
}

const onTileClick = (rowIndex: number, colIndex: number) => () => {
  if (state.ui.showGrid) {
    state.ui.selectedCell = {
      rowIndex,
      colIndex,
    }
  }
}

const onMouseOver = (rowIndex: number, colIndex: number) => () => {
  if (state.ui.expandingNode || state.ui.addingAtom) {
    state.ui.hoveredCell = {
      rowIndex,
      colIndex,
    }
  }

  if (state.ui.expandingNode) {
    const direction = state.ui.expandingNode.direction
    const node = state.ui.expandingNode.node
    const columnPositive = [DragDirection.E, DragDirection.SE, DragDirection.NE].includes(direction)
    const columnNegative = [DragDirection.W, DragDirection.SW, DragDirection.NW].includes(direction)
    const rowPositive = [DragDirection.S, DragDirection.SW, DragDirection.SE].includes(direction)
    const rowNegative = [DragDirection.N, DragDirection.NE, DragDirection.NW].includes(direction)

    if (columnPositive && colIndex + 2 > node.columnStart) {
      node.columnEnd = colIndex + 2
    }
    if (columnNegative && colIndex + 1 < node.columnEnd) {
      node.columnStart = colIndex + 1
    }
    if (rowPositive && rowIndex + 2 > node.rowStart) {
      node.rowEnd = rowIndex + 2
    }
    if (rowNegative && rowIndex + 1 < node.rowEnd) {
      node.rowStart = rowIndex + 1
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
            (state.ui.hoveredCell.colIndex === colIndex && state.ui.hoveredCell.rowIndex === rowIndex)
          }
          onClick={onTileClick(rowIndex, colIndex)}
          onMouseOver={onMouseOver(rowIndex, colIndex)}
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
  <GridOverlayWrapper visible={state.ui.expandingNode || state.ui.showGrid || state.ui.addingAtom}>
    {state.ui.showGrid && (
      <>
        <GridTop rootNode={rootNode}>
          {rootNode.columns.map((_, colIndex) => {
            const selected = state.ui.selectedCell && state.ui.selectedCell.colIndex === colIndex
            return (
              <BorderTop
                key={`col_${colIndex}`}
                col={colIndex + 1}
                selected={selected}
                onClick={onTileClick(null, colIndex)}
              >
                {selected && (
                  <TopText>
                    <Input value={rootNode.columns[colIndex].value} onChange={changeColumnValue(colIndex)} />
                    <select value={rootNode.columns[colIndex].unit} onChange={changeColumnUnits(colIndex)}>
                      <option value={Units.Px}>Px</option>
                      <option value={Units.Fr}>Fr</option>
                    </select>
                    <DeleteColumnButton onClick={deleteColumn(colIndex)}>X</DeleteColumnButton>
                  </TopText>
                )}
              </BorderTop>
            )
          })}
        </GridTop>
        <GridLeft rootNode={rootNode}>
          {rootNode.rows.map((_, rowIndex) => {
            const selected = state.ui.selectedCell && state.ui.selectedCell.rowIndex === rowIndex
            return (
              <>
                <BorderLeft
                  key={`row_${rowIndex}`}
                  row={rowIndex + 1}
                  selected={selected}
                  onClick={onTileClick(rowIndex, null)}
                >
                  {selected && (
                    <LeftText>
                      <Input value={rootNode.rows[rowIndex].value} onChange={changeRowValue(rowIndex)} />
                      <select value={rootNode.rows[rowIndex].unit} onChange={changeRowUnits(rowIndex)}>
                        <option value={Units.Px}>Px</option>
                        <option value={Units.Fr}>Fr</option>
                      </select>
                      <DeleteRowButton onClick={deleteRow(rowIndex)}>X</DeleteRowButton>
                    </LeftText>
                  )}
                </BorderLeft>
              </>
            )
          })}
        </GridLeft>
        <AddColumnButton onClick={addColumn}>+</AddColumnButton>
        <AddRowButton onClick={addRow}>+</AddRowButton>
      </>
    )}
    <GridWrapper>
      <Grid rootNode={rootNode}>
        {!(state.ui.addingAtom || state.ui.expandingNode) && state.ui.selectedNode && (
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

        {(state.ui.expandingNode || state.ui.showGrid || state.ui.addingAtom) && <FullGrid rootNode={rootNode} />}
      </Grid>
    </GridWrapper>
  </GridOverlayWrapper>
)

export default GridOverlay
