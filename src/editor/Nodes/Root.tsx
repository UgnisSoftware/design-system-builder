import { ElementNode, RootNode } from '@src/interfaces/nodes'
import * as React from 'react'
import styled from 'styled-components'

interface RootProps {
  component: RootNode
  parent: ElementNode | null
  children: React.ReactNode
}

const RootWrapper = styled.div<RootProps>`
  position: relative;
  display: grid;
  grid-template-columns: ${({ component }) => component.columns.map(col => col.value + col.unit).join(' ')};
  grid-template-rows: ${({ component }) => component.rows.map(col => col.value + col.unit).join(' ')};
  grid-column: ${({ component }) => `${component.columnStart} / ${component.columnEnd}`};
  grid-row: ${({ component }) => `${component.rowStart} / ${component.rowEnd}`};
`

const Root = ({ component, parent, children }: RootProps) => (
  <RootWrapper parent={parent} component={component}>
    {children}
  </RootWrapper>
)

export default Root
