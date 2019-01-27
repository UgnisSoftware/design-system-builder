import * as React from 'react'
import styled from 'styled-components'

interface Props {
  name: string // TODO remove, looks useless?
  label?: string
  value: string | number
  className?: string
  autoFocus?: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column-reverse;
  max-width: 250px;
`

const Label = styled.label`
  font-size: 12px;
  font-weight: 400;
  padding-bottom: 7px;
`

const Input = styled.input`
  all: unset;
  box-shadow: inset 0 -2px 0 0 rgba(0, 0, 0, 0.15);
  margin-right: 24px;
  max-width: 138px;
  padding-bottom: 4px;
  transition: all 200ms ease;

  &:hover {
    box-shadow: inset 0 -2px 0 0 rgba(0, 0, 0, 0.35);
  }

  &:focus {
    box-shadow: inset 0 -2px 0 0 rgba(0, 0, 0, 0.85);
  }

  &:focus ~ ${Label} {
    font-weight: 500;
  }
`

const TextInput = ({ name, label, value, onChange, className, autoFocus }: Props) => (
  <Wrapper className={className}>
    <Input
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      type="text"
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      autoFocus={autoFocus}
    />
    {label && <Label htmlFor={name}>{label}</Label>}
  </Wrapper>
)

export default TextInput
