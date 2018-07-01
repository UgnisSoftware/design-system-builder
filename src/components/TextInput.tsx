import * as React from 'react';
import styled from 'styled-components';

interface Props {
  name: string;
  label: string;
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column-reverse;
  max-width: 250px;
`;

const Label = styled.label`
  font-size: 12px;
  transition: all 300ms ease;
  padding-bottom: 7px;
`;

const Input = styled.input`
  outline: 0;
  box-shadow: inset 0 -2px 0 0 rgba(0, 0, 0, 0.15);
  border: none;
  margin-right: 24px;
  padding-bottom: 7px;
  transition: all 300ms ease;

  &:hover {
    box-shadow: inset 0 -2px 0 0 rgba(0, 0, 0, 0.35);
  }

  &:focus {
    box-shadow: inset 0 -2px 0 0 #1976d2;
  }

  &:focus ~ ${Label} {
    color: #1976d2;
  }
`;

const TextInput = ({ name, label, value, onChange }: Props) => (
  <Wrapper>
    <Input type="text" id={name} name={name} value={value} onChange={onChange} />
    <Label htmlFor={name}>{label} </Label>
  </Wrapper>
);

export default TextInput;
