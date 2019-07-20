import state from '@state'
import * as React from 'react'
import styled from 'styled-components'
import { ElementNode, Nodes, TextNode } from '@src/interfaces/nodes'
import { selectComponent } from '@src/actions'

interface TextProps {
  component: TextNode
  parent?: ElementNode
}

const TextWrapper = styled.div<TextProps>`
  outline: none;
  position: relative;
  display: grid;
  grid-column: ${({ component }) => `${component.position.columnStart} / ${component.position.columnEnd}`};
  grid-row: ${({ component }) => `${component.position.rowStart} / ${component.position.rowEnd}`};
  justify-self: ${({ component }) => component.alignment.horizontal};
  align-self: ${({ component }) => component.alignment.vertical};
  font-size: ${({ component }) =>
    state.settings.fonts.find(font => font.id === component.fontFamilyId).sizes[component.fontSize].fontSize};
  line-height: ${({ component }) =>
    state.settings.fonts.find(font => font.id === component.fontFamilyId).sizes[component.fontSize].lineHeight};
  color: ${({ component }) =>
    component.fontColorId ? state.settings.colors.find(color => color.id === component.fontColorId).hex : 'black'};
  font-family: ${({ component }) => state.settings.fonts.find(font => font.id === component.fontFamilyId).fontFamily};
  overflow-wrap: break-word;
  white-space: pre;
`

const changeTextValue = e => {
  e.preventDefault()
  e.stopPropagation()
  ;(state.ui.selectedNode as TextNode).text = e.target.innerText
}

const componentToStyle = (component: TextNode) => {
  if (state.ui.selectedNode === component && state.ui.stateManager) {
    return { ...component, ...component.states[state.ui.stateManager] }
  }
  return component
}

class TextComponent extends React.Component<TextProps, { inEditing: boolean }> {
  state = {
    inEditing: false,
  }

  editText = (component: Nodes) => () => {
    this.setState({ inEditing: true })
    state.ui.editingTextNode = component
  }

  static getDerivedStateFromProps(props, componentState) {
    const stopEditing = state.ui.editingTextNode !== props.component
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
    const { component, parent } = this.props
    return (
      <TextWrapper
        component={componentToStyle(component)}
        parent={parent}
        onMouseDown={selectComponent(component, parent)}
        onDoubleClick={this.editText(component)}
        onInput={changeTextValue}
        suppressContentEditableWarning={true}
        contentEditable={this.state.inEditing ? 'true' : 'false'}
        onPaste={e => {
          e.preventDefault()
          const text = e.clipboardData.getData('text/plain')
          document.execCommand('insertHTML', false, text)
        }}
      >
        {component.text}
      </TextWrapper>
    )
  }
}

export default TextComponent
