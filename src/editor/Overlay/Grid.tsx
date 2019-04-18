import * as React from 'react'
import styled from 'styled-components'
import { RootNode } from '@src/Interfaces/nodes'
import { Colors } from '@src/styles'

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
  component: RootNode
}

const GridTop = styled.div`
  position: absolute;
  width: calc(100% - 70px);
  left: 70px;
  top: 0px;
  display: grid;
  grid-template-columns: ${({ component }: Props) => component.columns.map(col => col.value + col.unit).join(' ')};
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
  grid-template-rows: ${({ component }: Props) => component.rows.map(col => col.value + col.unit).join(' ')};
`
const GridOverlay = ({ component }: Props) => (
  <>
    <GridTop component={component}>
      {component.columns.map((_, colIndex) => (
        <BorderTop key={`col_${colIndex}`} col={colIndex + 1} />
      ))}
    </GridTop>
    <GridLeft component={component}>
      {component.rows.map((_, rowIndex) => (
        <BorderLeft key={`row_${rowIndex}`} row={rowIndex + 1} />
      ))}
    </GridLeft>
  </>
)

export default GridOverlay
