import * as React from 'react'
import styled from 'styled-components'
import { useRef, useState } from 'react'
import useClickAway from 'react-use/esm/useClickAway'

interface Props {
  options: string[]
  value: string
  placeholder?: string
  className?: string
  onChange: (option: string) => void
  toName?: (option: string) => void
}

interface MenuProps {
  options: string[]
  updateOpen: (isOpen: boolean) => void
  onChange: (option: string) => void
  toName?: (option: string) => void
}

const Wrapper = styled.div`
  position: relative;
  font-size: 20px;
`

const ValueWrapper = styled.div``

const Value = styled.div``

const Placeholder = styled.div``

const MenuWrapper = styled.div`
  z-index: 999999;
  position: absolute;
  top: 0;
  right: 0;
  background: rgb(248, 248, 248);
  box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14),
    0px 2px 1px -1px rgba(0, 0, 0, 0.12);
`
const MenuItem = styled.div`
  border-bottom: 1px solid rgb(242, 242, 242);
  padding: 16px;
  &:hover {
    background: rgb(240, 240, 240);
  }
`

const Menu = ({ options, updateOpen, onChange, toName }: MenuProps) => {
  const ref = useRef(null)

  useClickAway(ref, () => {
    updateOpen(false)
  })

  return (
    <MenuWrapper ref={ref}>
      {options.map(option => (
        <MenuItem
          key={option}
          onClick={() => {
            onChange(option)
            updateOpen(false)
          }}
        >
          {toName ? toName(option) : option}
        </MenuItem>
      ))}
    </MenuWrapper>
  )
}

const Select = ({ value, onChange, options, className, placeholder, toName }: Props) => {
  const [open, updateOpen] = useState(false)

  return (
    <Wrapper className={className}>
      <ValueWrapper>
        {value ? (
          <Value onClick={() => updateOpen(true)}>{toName ? toName(value) : value}</Value>
        ) : (
          <Placeholder onClick={() => updateOpen(true)}>{placeholder}</Placeholder>
        )}
      </ValueWrapper>

      {open && <Menu options={options} updateOpen={updateOpen} onChange={onChange} toName={toName} />}
    </Wrapper>
  )
}

export default Select
