import * as React from 'react'
import styled from 'styled-components'
import { RootNode } from '@src/Interfaces/nodes'
import state from '@state'

interface BorderProps {
  col: number
  row: number
  selected?: boolean
}

const Border = styled.div`
  grid-column: ${({ col }: BorderProps) => `${col} / ${col + 1}`};
  grid-row: ${({ row }: BorderProps) => `${row} / ${row + 1}`};
  background: ${({ selected }: BorderProps) => (selected ? `rgba(0,0,0,.25)` : 'none')};
  border: #565656 dashed 1px;
  user-select: none;
  pointer-events: none;
`
const Grid = styled.div`
  pointer-events: none;
  user-select: none;

  position: absolute;
  width: 100%;
  height: 100%;
  left: 0px;
  top: 0px;
  display: grid;
  grid-template-columns: ${({ component }: Props) => component.columns.map(col => col.value + col.unit).join(' ')};
  grid-template-rows: ${({ component }: Props) => component.rows.map(col => col.value + col.unit).join(' ')};
`

interface Props {
  component: RootNode
}

const onMouseOver = (component: RootNode, rowIndex: number, colIndex: number) => () => {
  if (state.ui.addingAtom || state.ui.draggingNodePosition) {
    state.ui.hoveredCell = {
      component: component,
      rowIndex,
      colIndex,
    }
  }
}

const AddComponentOverlay = ({ component }: Props) => (
  <Grid component={component}>
    {component.rows.map((_, rowIndex) =>
      component.columns.map((_, colIndex) => (
        <Border
          key={`${colIndex}_${rowIndex}`}
          row={rowIndex + 1}
          col={colIndex + 1}
          selected={
            state.ui.hoveredCell &&
            (state.ui.hoveredCell.component === component &&
              state.ui.hoveredCell.colIndex === colIndex &&
              state.ui.hoveredCell.rowIndex === rowIndex)
          }
          onMouseOver={onMouseOver(component, rowIndex, colIndex)}
        />
      )),
    )}
  </Grid>
)

export default AddComponentOverlay
