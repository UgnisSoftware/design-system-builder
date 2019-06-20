import * as React from 'react'
import styled, { css } from 'styled-components'

import state from '@state'
import { Element } from '@src/interfaces/elements'
import TextInput from '@components/TextInput'
import { Colors } from '@src/styles'
import { useState } from 'react'
import { useRef } from 'react'
import useClickAway from 'react-use/esm/useClickAway'
import useKeyPress from 'react-use/esm/useKeyPress'

interface ItemProps {
  selected?: boolean
}

const DeleteIcon = styled.div`
  display: none;
  position: absolute;
  top: 0;
  bottom: 0;
  padding: 0 8px;
  right: 0;
  &:hover {
    background: rgb(225, 225, 225);
  }
`

export const Item = styled.div`
  position: relative;
  font-size: 16px;
  font-weight: 400;
  color: ${Colors.grey900};
  line-height: 40px;
  height: 40px;
  transition: background 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;
  padding-left: 24px;
  cursor: pointer;
  &:hover {
    background: rgb(238, 238, 238);
  }
  &:hover ${DeleteIcon} {
    display: block;
  }
  ${(props: ItemProps) =>
    props.selected &&
    css`
      color: ${Colors.grey900};
      font-weight: 500;
      background: rgb(238, 238, 238);
      border-right: 3px solid rgb(83, 212, 134);
    `};
`

const Input = styled(TextInput)`
  padding-left: 24px;
  font-weight: 500;
  height: 40px;
  padding-top: 3px;
  display: flex;
  justify-content: center;
  background: rgb(232, 232, 233);
  border-right: 3px solid rgb(83, 212, 134);
`

interface Props {
  component: Element
  onClick: () => void
  onDelete: () => void
}

const ComponentItem = (props: Props) => {
  const [editingName, updateEditingName] = useState(false)
  const [name, updateName] = useState('')

  const onExitWithoutSave = () => {
    updateName(props.component.name)
    updateEditingName(false)
  }
  const save = () => {
    if (name) {
      props.component.name = name
      updateEditingName(false)
    } else {
      onExitWithoutSave()
    }
  }
  const onDelete = e => {
    e.stopPropagation()
    props.onDelete()
  }

  const ref = useRef(null)
  useClickAway(ref, save)
  useKeyPress(e => {
    const ENTER = 13
    const ESCAPE = 27
    if (e.keyCode === ENTER) {
      save()
    }
    if (e.keyCode === ESCAPE) {
      onExitWithoutSave()
    }
    return false
  })

  if (editingName) {
    return (
      <div ref={ref}>
        <Input value={name} name="AddComponent" autoFocus={true} onChange={e => updateName(e.target.value)} />
      </div>
    )
  }
  return (
    <Item
      onClick={props.onClick}
      selected={state.ui.router[1] === props.component.id}
      onDoubleClick={() => updateEditingName(true)}
    >
      {props.component.name}
      <DeleteIcon className="material-icons" onClick={onDelete}>
        delete
      </DeleteIcon>
    </Item>
  )
}

export default ComponentItem
