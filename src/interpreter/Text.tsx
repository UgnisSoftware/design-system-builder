import stateSettings from '@state/settings'
import stateUi from '@state/ui'
import * as React from 'react'
import styled from 'styled-components'
import { ElementNode, Nodes, TextNode } from '@src/interfaces/nodes'
import { selectComponent } from '@src/actions'
import { getSelectedNode } from '@src/utils'

interface TextProps {
  component: TextNode
  parent?: ElementNode
  tilted: boolean
  index: number
}

const TextWrapper = styled.div<TextProps>`
  transition: all 0.3s;
  outline: none;
  position: relative;
  display: grid;
  grid-column: ${({ component }) => `${component.columnStart} / ${component.columnEnd}`};
  grid-row: ${({ component }) => `${component.rowStart} / ${component.rowEnd}`};
  justify-self: ${({ component }) => component.horizontalAlign};
  align-self: ${({ component }) => component.verticalAlign};
  font-size: ${({ component }) =>
    stateSettings.fonts.find((font) => font.id === component.fontFamilyId).sizes[component.fontSize].fontSize};
  line-height: ${({ component }) =>
    stateSettings.fonts.find((font) => font.id === component.fontFamilyId).sizes[component.fontSize].lineHeight};
  color: ${({ component }) =>
    component.fontColorId ? stateSettings.colors.find((color) => color.id === component.fontColorId).hex : 'black'};
  font-family: ${({ component }) => stateSettings.fonts.find((font) => font.id === component.fontFamilyId).fontFamily};
  overflow-wrap: break-word;
  white-space: pre;
  transform: ${({ tilted, index }) =>
    tilted ? `translateZ(0) translateX(${10 * index}px) translateY(-${10 * index}px)` : ''};
  text-shadow: ${({ tilted }) => (tilted ? `-10px 10px 2px rgba(100, 100, 100, 0.5)` : '')};
`

const changeTextValue = (e) => {
  e.preventDefault()
  e.stopPropagation()
  ;(stateUi.selectedNode as TextNode).text = e.target.innerText
}

const componentToStyle = (component: TextNode) => {
  if (stateUi.selectedNode && stateUi.selectedNode.id === component.id && stateUi.stateManager) {
    return getSelectedNode()
  }
  return component
}

class TextComponent extends React.Component<TextProps, { inEditing: boolean }> {
  state = {
    inEditing: false,
  }

  editText = (component: Nodes) => () => {
    this.setState({ inEditing: true })
    stateUi.editingTextNode = component
  }

  static getDerivedStateFromProps(props, componentState) {
    const stopEditing = stateUi.editingTextNode !== props.component
    if (componentState.inEditing && stopEditing) {
      return { inEditing: false }
    }
    return null
  }

  shouldComponentUpdate(_, nextState) {
    if (this.state.inEditing !== nextState.inEditing) {
      return true
    }
    if (this.state.inEditing) {
      return false
    }
    return true
  }

  render() {
    const { component, parent, tilted, index } = this.props
    return (
      <TextWrapper
        component={componentToStyle(component)}
        parent={parent}
        onMouseDown={selectComponent(component, parent)}
        onDoubleClick={this.editText(component)}
        onInput={changeTextValue}
        suppressContentEditableWarning={true}
        contentEditable={this.state.inEditing ? 'true' : 'false'}
        onPaste={(e) => {
          e.preventDefault()
          const text = e.clipboardData.getData('text/plain')
          document.execCommand('insertHTML', false, text)
        }}
        tilted={tilted}
        index={index}
      >
        {component.text}
      </TextWrapper>
    )
  }
}

export default TextComponent
