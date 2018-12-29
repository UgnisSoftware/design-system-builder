import * as React from 'react'
import styled from 'styled-components'
import ClickOutside from 'react-click-outside'

import TextInput from '@components/TextInput'

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

class AddComponent extends React.Component<Props> {
  state = {
    value: '',
  }

  updateValue = e => {
    this.setState({ value: e.target.value })
  }

  componentDidMount() {
    document.addEventListener('keydown', this.maybeSave)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.maybeSave)
  }

  maybeSave = e => {
    const ENTER = 13
    const ESCAPE = 27
    if (e.keyCode === ENTER) {
      this.props.onSave(this.state.value)
    }
    if (e.keyCode === ESCAPE) {
      this.props.onSave('')
    }
  }

  render() {
    return (
      <ClickOutside onClickOutside={() => this.props.onSave(this.state.value)}>
        <Input value={this.state.value} name="AddComponent" autoFocus={true} onChange={this.updateValue} />
      </ClickOutside>
    )
  }
}

export default AddComponent
