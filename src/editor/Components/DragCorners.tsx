import styled from 'styled-components'
import { Padding, Node, Units, GridProperty, DragDirection } from '../../interfaces'
import * as React from 'react'
import state from '@state'
import TextInput from '../../components/TextInput'
import { Colors } from '../../styles'
import { connect } from 'lape'

interface BorderProps {
  col: number
  row: number
}

const Border = styled.div`
  grid-column: ${({ col }: BorderProps) => `${col} / ${col + 1}`};
  grid-row: ${({ row }: BorderProps) => `${row} / ${row + 1}`};

  border: #565656 dashed 1px;
  user-select: none;
`

const ColumnDelete = styled.div`
  grid-column: ${({ col }: BorderProps) => `${col} / ${col + 1}`};
  grid-row: ${({ row }: BorderProps) => `${row} / ${row + 1}`};

  position: absolute;
  top: -130px;
  width: 20px;
  height: 20px;
  left: calc(50% - 40px);
  background: firebrick;
  border-radius: 50%;
  cursor: pointer;
`
const ColumnInput = styled(TextInput)`
  grid-column: ${({ col }: BorderProps) => `${col} / ${col + 1}`};
  grid-row: ${({ row }: BorderProps) => `${row} / ${row + 1}`};

  position: absolute;
  top: -100px;
  width: 80px;
  left: calc(50% - 40px);
`
const ColumnUnitInput = styled(TextInput)`
  grid-column: ${({ col }: BorderProps) => `${col} / ${col + 1}`};
  grid-row: ${({ row }: BorderProps) => `${row} / ${row + 1}`};

  position: absolute;
  top: -100px;
  width: 50px;
  left: calc(50% + 25px);
`

const RowDelete = styled.div`
  grid-column: ${({ col }: BorderProps) => `${col} / ${col + 1}`};
  grid-row: ${({ row }: BorderProps) => `${row} / ${row + 1}`};

  position: absolute;
  left: -145px;
  width: 20px;
  height: 20px;
  top: calc(50% - 20px);
  background: firebrick;
  border-radius: 50%;
  cursor: pointer;
`
const RowInput = styled(TextInput)`
  grid-column: ${({ col }: BorderProps) => `${col} / ${col + 1}`};
  grid-row: ${({ row }: BorderProps) => `${row} / ${row + 1}`};

  position: absolute;
  left: -120px;
  width: 80px;
  top: calc(50% - 20px);
`
const RowUnitInput = styled(TextInput)`
  grid-column: ${({ col }: BorderProps) => `${col} / ${col + 1}`};
  grid-row: ${({ row }: BorderProps) => `${row} / ${row + 1}`};

  position: absolute;
  left: -55px;
  width: 50px;
  top: calc(50% - 20px);
`

const AddColumn = styled.div`
  position: absolute;
  right: -70px;
  top: calc(50% - 20px);
  background-color: aqua;
  width: 40px;
  height: 40px;
  border-radius: 50%;
`
const AddRow = styled.div`
  position: absolute;
  bottom: -70px;
  left: calc(50% - 20px);
  background-color: aqua;
  width: 40px;
  height: 40px;
  border-radius: 50%;
`
const PaddingTop = styled(TextInput)`
  position: absolute;
  top: 0;
  left: -72px;
  width: 64px;
`

const PaddingLeft = styled(TextInput)`
  position: absolute;
  top: -46px;
  left: 0;
  width: 64px;
`

const PaddingBottom = styled(TextInput)`
  position: absolute;
  bottom: 0;
  left: -72px;
  width: 64px;
`

const PaddingRight = styled(TextInput)`
  position: absolute;
  top: -46px;
  right: 0;
  width: 64px;
`

const drag = (node: Node, parent: Node, direction: DragDirection) => e => {
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
  position: absolute;
  transition: all 0.3s;
  width: 12px;
  height: 12px;
  background: ${Colors.accent};
`
const TopLeftDrag = styled(CornerDrag)`
  top: -6px;
  left: -6px;
  cursor: nw-resize;
`
const TopRightDrag = styled(CornerDrag)`
  top: -6px;
  right: -6px;
  cursor: ne-resize;
`

const BottomLeftDrag = styled(CornerDrag)`
  bottom: -6px;
  left: -6px;
  cursor: sw-resize;
`
const BottomRightDrag = styled(CornerDrag)`
  bottom: -6px;
  right: -6px;
  cursor: se-resize;
`

const addColumn = (component: Node) => _ => {
  component.columns.push({ value: 1, unit: Units.Fr })
}
const addRow = (component: Node) => _ => {
  component.rows.push({ value: 100, unit: Units.Px })
}

const onMouseOver = (component: Node, rowIndex: number, colIndex: number) => () => {
  if (state.ui.addingAtom || state.ui.draggingNodePosition) {
    state.ui.hoveredCell = {
      component: component,
      rowIndex,
      colIndex,
    }
  }
}

const changePadding = (component: Node, position: keyof Padding) => e => {
  component.padding[position] = e.target.value
}

const changeValue = (track: GridProperty) => e => {
  track.value = e.target.value
}
const changeUnit = (track: GridProperty) => e => {
  track.unit = e.target.value
}

const deleteColumn = (component: Node, index: number) => () => {
  component.columns.splice(index, 1)
}

const deleteRow = (component: Node, index: number) => () => {
  component.rows.splice(index, 1)
}

interface Props {
  component: Node
  parent: Node | null
}
const DragCorners = ({ component, parent }: Props) => {
  const editingComponent = state.ui.editingBoxNode && state.ui.editingBoxNode.id === component.id
  const addingNodesAndCanHaveChildren = state.ui.addingAtom && component.children
  const draggingNode = state.ui.draggingNodePosition && state.ui.selectedNode !== component && component.children

  const showCorners =
    state.ui.selectedNode === component && !(state.ui.editingBoxNode && state.ui.editingBoxNode.id === component.id)
  const showGrid = editingComponent || addingNodesAndCanHaveChildren || draggingNode
  const showGridInputs = !state.ui.addingAtom && !state.ui.draggingNodePosition
  return (
    <>
      {showCorners && (
        <>
          <TopDrag onMouseDown={drag(component, parent, DragDirection.N)} />
          <LeftDrag onMouseDown={drag(component, parent, DragDirection.W)} />
          <RightDrag onMouseDown={drag(component, parent, DragDirection.E)} />
          <BottomDrag onMouseDown={drag(component, parent, DragDirection.S)} />
          <TopLeftDrag onMouseDown={drag(component, parent, DragDirection.NW)} />
          <TopRightDrag onMouseDown={drag(component, parent, DragDirection.NE)} />
          <BottomLeftDrag onMouseDown={drag(component, parent, DragDirection.SW)} />
          <BottomRightDrag onMouseDown={drag(component, parent, DragDirection.SE)} />
        </>
      )}
      {showGrid && (
        <>
          {component.rows.map((_, rowIndex) =>
            component.columns.map((_, colIndex) => (
              <Border
                key={`${colIndex}_${rowIndex}`}
                row={rowIndex + 1}
                col={colIndex + 1}
                onMouseOver={onMouseOver(component, rowIndex, colIndex)}
              />
            )),
          )}

          {showGridInputs && (
            <>
              {component.columns.map((col, colIndex) => (
                <>
                  <ColumnInput
                    value={col.value}
                    onChange={changeValue(col)}
                    key={`value_${colIndex}`}
                    row={1}
                    col={colIndex + 1}
                  />
                  <ColumnUnitInput
                    value={col.unit}
                    onChange={changeUnit(col)}
                    key={`unit_${colIndex}`}
                    row={1}
                    col={colIndex + 1}
                  />
                  <ColumnDelete row={1} col={colIndex + 1} onClick={deleteColumn(component, colIndex)} />
                </>
              ))}
              {component.rows.map((row, rowIndex) => (
                <>
                  <RowInput
                    value={row.value}
                    onChange={changeValue(row)}
                    key={`value_${rowIndex}`}
                    row={rowIndex + 1}
                    col={1}
                  />
                  <RowUnitInput
                    value={row.unit}
                    onChange={changeUnit(row)}
                    key={`unit_${rowIndex}`}
                    row={rowIndex + 1}
                    col={1}
                  />
                  <RowDelete row={rowIndex + 1} col={1} onClick={deleteRow(component, rowIndex)} />
                </>
              ))}

              <PaddingTop name="paddingTop" value={component.padding.top} onChange={changePadding(component, 'top')} />
              <PaddingLeft
                name="paddingLeft"
                value={component.padding.left}
                onChange={changePadding(component, 'left')}
              />
              <PaddingBottom
                name="paddingBottom"
                value={component.padding.bottom}
                onChange={changePadding(component, 'bottom')}
              />
              <PaddingRight
                name="paddingRight"
                value={component.padding.right}
                onChange={changePadding(component, 'right')}
              />

              <AddColumn onClick={addColumn(component)} />
              <AddRow onClick={addRow(component)} />
            </>
          )}
        </>
      )}
    </>
  )
}

export default connect(DragCorners)
