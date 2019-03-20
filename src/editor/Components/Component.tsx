import * as React from 'react'
import ImageComponent from '@src/editor/Components/Image/ImageComponent'
import BoxComponent from '@src/editor/Components/Box/BoxComponent'
import InputComponent from '@src/editor/Components/Input/InputComponent'
import TextComponent from '@src/editor/Components/Text/TextComponent'
import { Node, NodeTypes } from '@src/interfaces'

interface Props {
  component: Node
  parent: Node | null
}
function Component({ component, parent }: Props) {
  if (component.type === NodeTypes.Box) {
    return <BoxComponent component={component} parent={parent} />
  }
  if (component.type === NodeTypes.Text) {
    return <TextComponent component={component} parent={parent} />
  }
  if (component.type === NodeTypes.Input) {
    return <InputComponent component={component} parent={parent} />
  }
  if (component.type === NodeTypes.Image) {
    return <ImageComponent component={component} parent={parent} />
  }
}

export default Component
