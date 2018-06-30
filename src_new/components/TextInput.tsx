import * as React from 'react';

interface Props {
  id: string;
  name: string;
  label: string;
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const TextInput = ({ id, name, label, value, onChange }: Props) => (
  <div className="text-input">
    <label htmlFor={id}>{label}: </label>
    <input type="text" id={id} name={name} value={value} onChange={onChange} />
  </div>
);

export default TextInput;
