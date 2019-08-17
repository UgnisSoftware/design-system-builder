import { RootNode } from '@src/interfaces/nodes'
import * as React from 'react'
import styled from 'styled-components'

interface RootProps {
  component: RootNode
  children: React.ReactNode
  tilted: boolean
  index: number
}

const RootWrapper = styled.div<RootProps>`
  transition: all 0.3s;
  position: relative;
  display: grid;
  justify-content: center;
  grid-template-columns: ${({ component }) => component.columns.map(col => col.value + col.unit).join(' ')};
  grid-template-rows: ${({ component }) => component.rows.map(col => col.value + col.unit).join(' ')};
  grid-column: ${({ component }) => `${component.columnStart} / ${component.columnEnd}`};
  grid-row: ${({ component }) => `${component.rowStart} / ${component.rowEnd}`};
  transform: ${({ tilted, index }) =>
    tilted ? `translateZ(0) translateX(${10 * index}px) translateY(-${10 * index}px)` : ''};
  box-shadow: ${({ tilted }) => (tilted ? `-10px 10px 3px -3px rgba(100, 100, 100, 0.5)` : '')};
`

const Root = ({ component, children, tilted, index }: RootProps) => (
  <RootWrapper component={component} tilted={tilted} index={index}>
    {children}
  </RootWrapper>
)

export default Root
