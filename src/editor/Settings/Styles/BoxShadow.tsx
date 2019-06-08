import React from 'react'
import styled from 'styled-components'

import { BoxShadow } from '@src/interfaces/settings'

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20px;
`
const Box = styled.div`
  box-shadow: ${({ value }) => value};
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

const onBoxShadowChange = (boxShadow: BoxShadow) => (event: React.ChangeEvent<HTMLInputElement>) => {
  boxShadow.value = event.target.value
}

interface Props {
  boxShadow: BoxShadow
}
const BoxShadow = ({ boxShadow }: Props) => (
  <Wrapper>
    <Box value={boxShadow.value} />
    <Input
      type="text"
      placeholder="Box Shadow"
      name="BoxShadow"
      defaultValue={boxShadow.value}
      onChange={onBoxShadowChange(boxShadow)}
    />
  </Wrapper>
)

export default BoxShadow
