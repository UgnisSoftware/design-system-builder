import stateSettings from '@state/settings'
import stateUi from '@state/ui'
import * as React from 'react'
import styled from 'styled-components'
import { ElementNode, IconNode } from '@src/interfaces/nodes'
import { selectComponent } from '@src/actions'
import { getSelectedNode } from '@src/utils'

interface TextProps {
  component: IconNode
  parent?: ElementNode
  tilted: boolean
  index: number
}

const IconWrapper = styled.div`
  transition: all 0.3s;
  position: relative;
  display: grid;
  grid-column: ${({ component }: TextProps) => `${component.columnStart} / ${component.columnEnd}`};
  grid-row: ${({ component }: TextProps) => `${component.rowStart} / ${component.rowEnd}`};
  color: ${({ component }: TextProps) =>
    component.fontColorId ? stateSettings.colors.find(color => color.id === component.fontColorId).hex : 'black'};
  font-size: ${({ component }: TextProps) => stateSettings.fonts[0].sizes[component.fontSize].fontSize};
  justify-self: ${({ component }: TextProps) => component.horizontalAlign};
  align-self: ${({ component }: TextProps) => component.verticalAlign};
  transform: ${({ tilted, index }) =>
    tilted ? `translateZ(0) translateX(${10 * index}px) translateY(-${10 * index}px)` : ''};
  text-shadow: ${({ tilted }) => (tilted ? `-10px 10px 2px rgba(100, 100, 100, 0.5)` : '')};
`

const componentToStyle = (component: IconNode) => {
  if (stateUi.selectedNode && stateUi.selectedNode.id === component.id && stateUi.stateManager) {
    return getSelectedNode()
  }
  return component
}

const IconComponent = ({ component, parent, tilted, index }: TextProps) => (
  <IconWrapper
    component={componentToStyle(component)}
    title="Visible"
    className="material-icons"
    onMouseDown={selectComponent(component, parent)}
    tilted={tilted}
    index={index}
  >
    {component.iconType}
  </IconWrapper>
)

export default IconComponent
