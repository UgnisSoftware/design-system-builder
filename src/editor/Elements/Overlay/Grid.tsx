import * as React from 'react'
import styled, { css } from 'styled-components'
import { Nodes, RootNode, Units } from '@src/interfaces/nodes'
import { Colors } from '@src/styles'
import stateUi from '@state/ui'
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
import times from 'ramda/src/times'

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
const InvisibleColumn = styled.div`
  grid-column: ${({ col }: BorderProps) => `${col} / ${col + 1}`};
  height: 100vh;
  transform: translateY(-50%);
`
const InvisibleRow = styled.div`
  grid-row: ${({ row }: BorderProps) => `${row} / ${row + 1}`};
  width: 100vw;
  transform: translateX(-50%);
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

  stateUi.expandingNode = {
    node,
    parent,
    direction,
  }

  function stopDragging(event) {
    stateUi.expandingNode = null
    stateUi.hoveredCell = null
    event.preventDefault()
    window.removeEventListener('mouseup', stopDragging)
    window.removeEventListener('touchend', stopDragging)
  }
  window.addEventListener('mouseup', stopDragging)
  window.addEventListener('touchend', stopDragging)
}

const SideDrag = styled.div`
  position: absolute;
  transition: all 0.3s;
  pointer-events: none;
`

const TopDrag = styled(SideDrag)`
  top: -12px;
  left: 0px;
  height: 12px;
  right: 0px;
  border-bottom: #565656 dashed 1px;
`
const BottomDrag = styled(SideDrag)`
  bottom: -12px;
  left: 0px;
  height: 12px;
  right: 0px;
  border-top: #565656 dashed 1px;
`
const LeftDrag = styled(SideDrag)`
  top: 0px;
  left: -12px;
  width: 12px;
  bottom: 0px;
  border-right: #565656 dashed 1px;
`
const RightDrag = styled(SideDrag)`
  top: 0px;
  right: -12px;
  width: 12px;
  bottom: 0px;
  border-left: #565656 dashed 1px;
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
const ArrowRight = styled(StylelessButton)`
  position: absolute;
  top: -20px;
  right: -8px;
  width: 16px;
  height: 8px;
  background: ${Colors.accent};
  cursor: e-resize;
  pointer-events: all;
  filter: drop-shadow(0 0 1px #fff);

  &:after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -8px;
    width: 0;
    height: 0;
    border-top: solid 8px ${Colors.accent};
    border-left: solid 8px transparent;
    border-right: solid 8px transparent;
  }
`

const ArrowLeft = styled(ArrowRight)`
  left: -8px;
  right: auto;
  cursor: w-resize;
`

const ArrowTop = styled(StylelessButton)`
  position: absolute;
  left: -20px;
  top: -8px;
  width: 8px;
  height: 16px;
  background: ${Colors.accent};
  cursor: n-resize;
  pointer-events: all;
  filter: drop-shadow(0 0 1px #fff);
  &:after {
    content: '';
    position: absolute;
    left: 100%;
    top: 50%;
    margin-top: -8px;
    width: 0;
    height: 0;
    border-left: solid 8px ${Colors.accent};
    border-top: solid 8px transparent;
    border-bottom: solid 8px transparent;
  }
`

const ArrowBottom = styled(ArrowTop)`
  bottom: -8px;
  top: auto;
  cursor: s-resize;
`

interface Props {
  rootNode: RootNode
}

const onTileClick = (rowIndex: number, colIndex: number) => () => {
  if (stateUi.showGrid) {
    stateUi.selectedCell = {
      rowIndex,
      colIndex,
    }
  }
}

const onMouseOver = (rowIndex: number, colIndex: number) => event => {
  if (stateUi.addingAtom) {
    const box = (event.target as HTMLDivElement).getBoundingClientRect()

    stateUi.addingAtom = {
      ...stateUi.addingAtom,
      width: box.width,
      height: box.height,
    }
    stateUi.hoveredCell = {
      rowIndex,
      colIndex,
    }
  }

  if (stateUi.expandingNode) {
    stateUi.hoveredCell = {
      rowIndex,
      colIndex,
    }
    const direction = stateUi.expandingNode.direction
    const node = stateUi.expandingNode.node
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
            stateUi.hoveredCell &&
            (stateUi.hoveredCell.colIndex === colIndex && stateUi.hoveredCell.rowIndex === rowIndex)
          }
          onClick={onTileClick(rowIndex, colIndex)}
          onMouseOver={onMouseOver(rowIndex, colIndex)}
        />
      )),
    )}
  </>
)

const DragGrid = ({ rootNode }: Props) => {
  const direction = stateUi.expandingNode.direction
  if (direction === DragDirection.E || direction === DragDirection.W) {
    return (
      <>
        {rootNode.columns.map((_, colIndex) => (
          <InvisibleColumn key={`${colIndex}`} col={colIndex + 1} onMouseOver={onMouseOver(0, colIndex)} />
        ))}
      </>
    )
  }
  return (
    <>
      {rootNode.rows.map((_, rowIndex) => (
        <InvisibleRow key={`${rowIndex}`} row={rowIndex + 1} onMouseOver={onMouseOver(rowIndex, 0)} />
      ))}
    </>
  )
}

interface SideProps {
  selected: number
  rootNode: RootNode
}

const GridColumns = ({ rootNode, selected }: SideProps) => {
  return (
    <GridTop rootNode={rootNode}>
      {rootNode.columns.map((_, colIndex) => {
        const isSelected = selected === colIndex
        return (
          <BorderTop
            key={`col_${colIndex}`}
            col={colIndex + 1}
            selected={isSelected}
            onClick={onTileClick(null, colIndex)}
          >
            {isSelected && (
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
  )
}
const GridRows = ({ rootNode, selected }: SideProps) => {
  return (
    <GridLeft rootNode={rootNode}>
      {rootNode.rows.map((_, rowIndex) => {
        const isSelected = selected === rowIndex
        return (
          <BorderLeft
            key={`row_${rowIndex}`}
            row={rowIndex + 1}
            selected={isSelected}
            onClick={onTileClick(rowIndex, null)}
          >
            {isSelected && (
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
        )
      })}
    </GridLeft>
  )
}

interface SideForSelectedProps {
  selectedNode: Nodes
  rootNode: RootNode
}
const GridColumnsForSelected = ({ rootNode, selectedNode }: SideForSelectedProps) => {
  const selected = times(
    index => index + selectedNode.columnStart - 1,
    (selectedNode.columnEnd === -1 ? rootNode.columns.length + 1 : selectedNode.columnEnd) - selectedNode.columnStart,
  )
  return (
    <GridTop rootNode={rootNode}>
      {rootNode.columns.map((_, colIndex) => {
        const isSelected = selected.includes(colIndex)
        return (
          <BorderTop key={`col_${colIndex}`} col={colIndex + 1} selected={isSelected}>
            {selected[0] === colIndex && (
              <ArrowLeft onMouseDown={drag(stateUi.selectedNode, rootNode, DragDirection.W)} />
            )}
            {selected[selected.length - 1] === colIndex && (
              <ArrowRight onMouseDown={drag(stateUi.selectedNode, rootNode, DragDirection.E)} />
            )}
          </BorderTop>
        )
      })}
    </GridTop>
  )
}
const GridRowsForSelected = ({ rootNode, selectedNode }: SideForSelectedProps) => {
  const selected = times(
    index => index + selectedNode.rowStart - 1,
    (selectedNode.rowEnd === -1 ? rootNode.rows.length + 1 : selectedNode.rowEnd) - selectedNode.rowStart,
  )
  return (
    <GridLeft rootNode={rootNode}>
      {rootNode.rows.map((_, rowIndex) => {
        const isSelected = selected.includes(rowIndex)
        return (
          <BorderLeft key={`row_${rowIndex}`} row={rowIndex + 1} selected={isSelected}>
            {selected[0] === rowIndex && (
              <ArrowTop onMouseDown={drag(stateUi.selectedNode, rootNode, DragDirection.N)} />
            )}
            {selected[selected.length - 1] === rowIndex && (
              <ArrowBottom onMouseDown={drag(stateUi.selectedNode, rootNode, DragDirection.S)} />
            )}
          </BorderLeft>
        )
      })}
    </GridLeft>
  )
}

/*
 * This Component is responsible for:
 *   Changing grid size  -- SHOW GRID
 *   Adding/removing columns/rows  -- SHOW GRID | COLUMN/ROW SELECTED
 *   Dropping other components into correct places -- ADDING ATOM
 *   Resizing components -- stateUi.expandingNode
 *   Editing text - stateUi.editingTextNode
 */
const GridOverlay = ({ rootNode }: Props) => {
  const nodeSelected = !stateUi.addingAtom && stateUi.selectedNode

  return (
    <GridOverlayWrapper visible={stateUi.expandingNode || stateUi.showGrid || stateUi.addingAtom}>
      {stateUi.showGrid && (
        <>
          <GridColumns rootNode={rootNode} selected={stateUi.selectedCell && stateUi.selectedCell.colIndex} />
          <GridRows rootNode={rootNode} selected={stateUi.selectedCell && stateUi.selectedCell.rowIndex} />
          <AddColumnButton onClick={addColumn}>+</AddColumnButton>
          <AddRowButton onClick={addRow}>+</AddRowButton>
        </>
      )}
      {nodeSelected && (
        <>
          <GridColumnsForSelected rootNode={rootNode} selectedNode={nodeSelected} />
          <GridRowsForSelected rootNode={rootNode} selectedNode={nodeSelected} />
        </>
      )}
      <GridWrapper>
        <Grid rootNode={rootNode}>
          {nodeSelected && (
            <BorderForSelected node={stateUi.selectedNode}>
              <TopDrag />
              <LeftDrag />
              <RightDrag />
              <BottomDrag />
            </BorderForSelected>
          )}
        </Grid>
        <Grid rootNode={rootNode}>
          {(stateUi.showGrid || stateUi.addingAtom) && <FullGrid rootNode={rootNode} />}
          {stateUi.expandingNode && <DragGrid rootNode={rootNode} />}
        </Grid>
      </GridWrapper>
    </GridOverlayWrapper>
  )
}
export default GridOverlay
