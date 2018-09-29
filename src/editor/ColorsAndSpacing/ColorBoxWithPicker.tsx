import * as React from 'react'
import styled from 'styled-components'
import { ChromePicker } from 'react-color'
import ClickOutside from 'react-click-outside'

import state from '@state'

const Wrapper = styled.div`
  position: relative;
  margin-bottom: 16px;
`

interface ColorBoxProps {
  color: string
}

const ColorBox = styled.div`
  cursor: pointer;
  width: 65px;
  height: 65px;
  border-radius: 7%;
  margin: 0 16px 0 0;
  background-color: ${(props: ColorBoxProps) => props.color};
`

const Input = styled.input`
  outline: 0;
  border: none;
  padding-bottom: 5px;
  transition: all 200ms ease;
  width: 135px;

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
  colorId: string
}

interface Color {
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

const onColorChange = (colorId: string) => (color: Color) => {
  state.colors[colorId].hex = color.hex
}

const onColorNameChange = (colorId: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
  state.colors[colorId].name = event.target.value
}

const onHexValueChange = (colorId: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
  state.colors[colorId].hex = event.target.value
}

const ColorBoxWithPicker = ({ colorId }: ColorBoxWithPickerProps) => (
  <Wrapper>
    <ColorWithInputWrapper>
      <ColorBox color={state.colors[colorId].hex} onClick={onEditingColorChange(colorId)} />
      <InputWrapper>
        <Input
          type="text"
          placeholder="Color name"
          id={colorId}
          name={colorId}
          value={state.colors[colorId].name}
          onChange={onColorNameChange(colorId)}
        />
        <Input
          type="text"
          placeholder="Hex value"
          id={colorId}
          name={colorId}
          value={state.colors[colorId].hex}
          onChange={onHexValueChange(colorId)}
        />
      </InputWrapper>
    </ColorWithInputWrapper>
    {state.ui.editingColorId === colorId && (
      <ClickOutside onClickOutside={onClickOutside}>
        <PickerWrapper>
          <ChromePicker color={state.colors[colorId]} onChange={onColorChange(colorId)} />
        </PickerWrapper>
      </ClickOutside>
    )}
  </Wrapper>
)

export default ColorBoxWithPicker
