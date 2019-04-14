import React from 'react'
import styled from 'styled-components'

import { Border } from '@src/Interfaces/styles'

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20px;
`
const Box = styled.div`
  border: ${({ border }) => border.style};
  border-radius: ${({ border }) => border.radius};
  width: 65px;
  height: 65px;
`

const Input = styled.input`
  outline: 0;
  border: none;
  padding-bottom: 5px;
  transition: all 200ms ease;
  width: 505px;

  &:hover {
    box-shadow: inset 0 -2px 0 0 rgba(0, 0, 0, 0.35);
  }

  &:focus {
    box-shadow: inset 0 -2px 0 0 rgba(0, 0, 0, 0.85);
  }
`

const onBorderRadiusChange = (border: Border) => (event: React.ChangeEvent<HTMLInputElement>) => {
  border.radius = event.target.value
}
const onBorderStyleChange = (border: Border) => (event: React.ChangeEvent<HTMLInputElement>) => {
  border.style = event.target.value
}

interface Props {
  border: Border
}
const BoxShadow = ({ border }: Props) => (
  <Wrapper>
    <Box border={border} />
    <Input
      type="text"
      placeholder="Box Shadow"
      name="BoxShadow"
      defaultValue={border.radius}
      onChange={onBorderRadiusChange(border)}
    />
    <Input
      type="text"
      placeholder="Box Shadow"
      name="BoxShadow"
      defaultValue={border.style}
      onChange={onBorderStyleChange(border)}
    />
  </Wrapper>
)

export default BoxShadow
