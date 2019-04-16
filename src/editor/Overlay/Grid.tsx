import * as React from 'react'
import styled from 'styled-components'
import { RootNode } from '@src/Interfaces/nodes'

interface Props {
  component: RootNode
}

const GridTop = styled.div`
  position: absolute;
  width: (100% - 70px);
  left: 70px;
  top: 0px;
  display: grid;
  grid-template-columns: ${({ component }: Props) => component.columns.map(col => col.value + col.unit).join(' ')};
  grid-template-rows: ${({ component }: Props) => component.rows.map(col => col.value + col.unit).join(' ')};
`

const GridOverlay = ({ component }: Props) => <GridTop component={component}>Put Grid here</GridTop>

export default GridOverlay
