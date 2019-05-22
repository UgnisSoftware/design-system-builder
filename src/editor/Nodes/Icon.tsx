import state from '@state'
import * as React from 'react'
import styled from 'styled-components'
import { ElementNode, IconNode } from '@src/interfaces/nodes'
import { selectComponent } from '@src/editor/Nodes/_utils'

interface TextProps {
  component: IconNode
  parent?: ElementNode
}

const IconWrapper = styled.div`
  position: relative;
  display: grid;
  opacity: ${({ parent }) => (state.ui.editingBoxNode && state.ui.editingBoxNode === parent ? 0.4 : 1)};
  grid-column: ${({ component }: TextProps) => `${component.position.columnStart} / ${component.position.columnEnd}`};
  grid-row: ${({ component }: TextProps) => `${component.position.rowStart} / ${component.position.rowEnd}`};
  color: ${({ component }: TextProps) =>
    component.fontColorId ? state.styles.colors.find(color => color.id === component.fontColorId).hex : 'black'};
  font-size: ${({ component }: TextProps) => state.styles.fonts[0].sizes[component.fontSize].fontSize};
  justify-self: ${({ component }: TextProps) => component.alignment.horizontal};
  align-self: ${({ component }: TextProps) => component.alignment.vertical};
`

const IconComponent = ({ component, parent }: TextProps) => (
  <IconWrapper
    component={component}
    title="Visible"
    className="material-icons"
    onMouseDown={selectComponent(component, parent)}
  >
    {component.iconType}
  </IconWrapper>
)

export default IconComponent
