import state from '@state'
import * as React from 'react'
import styled from 'styled-components'
import { ElementNode, IconNode } from '@src/interfaces/nodes'
import { selectComponent } from '@src/actions'
import { getSelectedNode } from '@src/utils'

interface TextProps {
  component: IconNode
  parent?: ElementNode
}

const IconWrapper = styled.div`
  position: relative;
  display: grid;
  grid-column: ${({ component }: TextProps) => `${component.columnStart} / ${component.columnEnd}`};
  grid-row: ${({ component }: TextProps) => `${component.rowStart} / ${component.rowEnd}`};
  color: ${({ component }: TextProps) =>
    component.fontColorId ? state.settings.colors.find(color => color.id === component.fontColorId).hex : 'black'};
  font-size: ${({ component }: TextProps) => state.settings.fonts[0].sizes[component.fontSize].fontSize};
  justify-self: ${({ component }: TextProps) => component.horizontalAlign};
  align-self: ${({ component }: TextProps) => component.verticalAlign};
`

const componentToStyle = (component: IconNode) => {
  if (state.ui.selectedNode && state.ui.selectedNode.id === component.id && state.ui.stateManager) {
    return getSelectedNode()
  }
  return component
}

const IconComponent = ({ component, parent }: TextProps) => (
  <IconWrapper
    component={componentToStyle(component)}
    title="Visible"
    className="material-icons"
    onMouseDown={selectComponent(component, parent)}
  >
    {component.iconType}
  </IconWrapper>
)

export default IconComponent
