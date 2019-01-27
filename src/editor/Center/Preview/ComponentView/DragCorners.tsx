import styled from 'styled-components'
import { Node, Units } from '@src/interfaces'
import * as React from 'react'
import state from '@state'

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

const addColumn = (component: Node) => _ => {
  component.columns.push({ value: 1, unit: Units.Fr })
}
const addRow = (component: Node) => _ => {
  component.rows.push({ value: 100, unit: Units.Px })
}

const onMouseOver = (component: Node, rowIndex: number, colIndex: number) => () => {
  if (state.ui.addingAtom) {
    state.ui.hoveredCell = {
      component: component,
      rowIndex,
      colIndex,
    }
  }
}

interface Props {
  component: Node
}
const DragCorners = ({ component }: Props) =>
  ((state.ui.selectedNode && state.ui.selectedNode.id === component.id) || state.ui.addingAtom) && (
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

      {!state.ui.addingAtom && (
        <>
          <AddColumn onClick={addColumn(component)} />
          <AddRow onClick={addRow(component)} />
        </>
      )}
    </>
  )

export default DragCorners
