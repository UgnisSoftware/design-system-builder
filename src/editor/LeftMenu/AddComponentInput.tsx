import * as React from 'react'
import styled from 'styled-components'

import TextInput from '@src/editor/components/TextInput'
import useClickAway from 'react-use/esm/useClickAway'
import useKey from 'react-use/esm/useKey'
import { useRef, useState } from 'react'

const Input = styled(TextInput)`
  padding-left: 24px;
  font-weight: 400;
  height: 40px;
  display: flex;
  justify-content: center;
`

interface Props {
  onSave: (value: string) => void
}

const AddComponent = (props: Props) => {
  const [value, updateValue] = useState('')
  const ref = useRef(null)
  useClickAway(ref, () => props.onSave(value))
  useKey(e => {
    const ENTER = 13
    const ESCAPE = 27
    if (e.keyCode === ENTER) {
      props.onSave(value)
    }
    if (e.keyCode === ESCAPE) {
      props.onSave('')
    }
    return false
  })
  return (
    <div ref={ref}>
      <Input value={value} name="AddComponent" autoFocus={true} onChange={e => updateValue(e.target.value)} />
    </div>
  )
}

export default AddComponent
