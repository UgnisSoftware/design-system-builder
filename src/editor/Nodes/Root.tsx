import { ElementNode, RootNode } from '@src/interfaces/nodes'
import state from '@state'
import * as React from 'react'
import styled from 'styled-components'
import { selectComponent } from '@src/actions'

interface RootProps {
  component: RootNode
  parent: ElementNode | null
  children: React.ReactNode
}

const RootWrapper = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: ${({ component }: RootProps) => component.columns.map(col => col.value + col.unit).join(' ')};
  grid-template-rows: ${({ component }: RootProps) => component.rows.map(col => col.value + col.unit).join(' ')};
  grid-column: ${({ component }: RootProps) => `${component.position.columnStart} / ${component.position.columnEnd}`};
  grid-row: ${({ component }: RootProps) => `${component.position.rowStart} / ${component.position.rowEnd}`};
`

const componentToStyle = (component: RootNode) => {
  if (state.ui.selectedNode === component && state.ui.stateManager) {
    return { ...component, ...component.states[state.ui.stateManager] }
  }
  return component
}

const Root = ({ component, parent, children }: RootProps) => (
  <RootWrapper parent={parent} component={componentToStyle(component)} onMouseDown={selectComponent(component, parent)}>
    {children}
  </RootWrapper>
)

export default Root
