import * as React from 'react'
import styled from 'styled-components'
import { ChromePicker } from 'react-color'
import ClickOutside from 'react-click-outside'
import chroma from 'chroma-js'

import state from '@state'
import { findNearestColor } from './colorList'
import { connect } from 'lape'
import { Color } from '@src/interfaces/settings'

const Wrapper = styled.div`
  position: relative;
  margin-bottom: 16px;
`

interface ColorBoxProps {
  color: string
}

const ColorDelete = styled.div`
  cursor: pointer;
  position: absolute;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${({ color }: ColorBoxProps) => color};
  color: ${({ color }: ColorBoxProps) => (chroma(color).luminance() > 0.5 ? 'black' : 'white')};
  top: -4px;
  right: -4px;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s;
`

const ColorBox = styled.div`
  position: relative;
  cursor: pointer;
  width: 65px;
  height: 65px;
  border-radius: 7%;
  margin: 0 16px 0 0;
  background-color: ${(props: ColorBoxProps) => props.color};
  &:hover ${ColorDelete} {
    opacity: 1;
  }
`

const Input = styled.input`
  outline: 0;
  border: none;
  padding-bottom: 5px;
  transition: all 200ms ease;
  width: 135px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;

  &:hover {
    box-shadow: inset 0 -2px 0 0 rgba(0, 0, 0, 0.35);
  }

  &:focus {
    box-shadow: inset 0 -2px 0 0 rgba(0, 0, 0, 0.85);
  }
`

const ColorWithInputWrapper = styled.div`
  display: flex;
`

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  padding: 2px 0;
  margin-right: 15px;
`

const PickerWrapper = styled.div`
  z-index: 1;
  position: absolute;
  top: 110%;
  left: 0;
`

interface ColorBoxWithPickerProps {
  color: Color
  editing: boolean
}

interface ColorChroma {
  hex: string
  rgb: {
    r: number
    g: number
    b: number
    a: number
  }
  hsl: {
    h: number
    s: number
    l: number
    a: number
  }
}

const onEditingColorChange = id => () => {
  state.ui.editingColorId = id
}

const onClickOutside = () => {
  state.ui.editingColorId = ''
}

const onColorChange = (color: Color) => (colorChroma: ColorChroma) => {
  color.name = findNearestColor(colorChroma.hex).name
  color.hex = colorChroma.hex
}

const onColorNameChange = (color: Color) => (event: React.ChangeEvent<HTMLInputElement>) => {
  color.name = event.target.value
}

const onHexValueChange = (color: Color) => (event: React.ChangeEvent<HTMLInputElement>) => {
  color.hex = event.target.value
}

const onDelete = (color: Color) => () => {
  state.settings.colors.splice(state.settings.colors.indexOf(color), 1)
}

const ColorBoxWithPicker = ({ color, editing }: ColorBoxWithPickerProps) => (
  <Wrapper>
    <ColorWithInputWrapper>
      <ColorBox color={color.hex} onClick={onEditingColorChange(color.id)}>
        <ColorDelete color={color.hex} onClick={onDelete(color)}>
          <i className="material-icons">clear</i>
        </ColorDelete>
      </ColorBox>
      <InputWrapper>
        <Input
          type="text"
          placeholder="Color name"
          id={color.id}
          name={color.id}
          value={color.name}
          onChange={onColorNameChange(color)}
        />
        <Input
          type="text"
          placeholder="Hex value"
          id={color.id}
          name={color.id}
          value={color.hex}
          onChange={onHexValueChange(color)}
        />
      </InputWrapper>
    </ColorWithInputWrapper>
    {editing && (
      <ClickOutside onClickOutside={onClickOutside}>
        <PickerWrapper>
          <ChromePicker color={color} onChange={onColorChange(color)} />
        </PickerWrapper>
      </ClickOutside>
    )}
  </Wrapper>
)

export default connect(ColorBoxWithPicker)
