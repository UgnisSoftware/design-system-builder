import { ElementNode, LabelNode } from '@src/interfaces/nodes'
import * as React from 'react'
import styled from 'styled-components'
import { selectComponent } from '@src/editor/Nodes/_utils'

interface BoxProps {
  component: LabelNode
  parent?: ElementNode
}

const Label = styled.label`
  transition: all 0.3s;
  position: relative;
  display: grid;
  outline: none;
`

const InputElement = ({ component, parent }: BoxProps) => (
  <Label for={component.id} component={component} onMouseDown={selectComponent(component, parent)}>
    {component.label}
  </Label>
)

export default InputElement
