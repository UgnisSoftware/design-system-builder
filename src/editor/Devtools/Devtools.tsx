import * as React from 'react'
import styled from 'styled-components'

import { Emitter } from 'lape'
import { Data } from 'lape/dist/eventEmitter'
import state from '@state'

const Root = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  background: bisque;
  width: 500px;
  overflow: auto;
`

const Header = styled.div`
  padding: 32px;
  display: flex;
  justify-content: space-evenly;
`
const Row = styled.div`
  padding: 8px 32px;
  display: flex;
`
const Line = styled.div`
  white-space: nowrap;
`
const Button = styled.button.attrs({ type: 'button' })`
  background: navy;
  color: azure;
  border-radius: 6px;
  border: none;
  padding: 16px;
  cursor: pointer;
  outline: inherit;
`
interface State {
  changingState: boolean
  disabled: boolean
  index: number
  stack: Map<object, Data>[]
}

class Devtools extends React.Component<{}, State> {
  state = {
    changingState: false,
    disabled: true,
    index: 0,
    stack: [],
  }

  componentDidMount() {
    Emitter.addSet(data => {
      if (this.state.changingState) {
        this.setState({ changingState: false })
        return
      }

      // I should have just used arrays...
      let reset = false
      let onlyUI = true
      data.forEach(entry => {
        if (entry.receiver === state.ui.router) {
          this.setState({ stack: [], index: 0 })
          reset = true
          return
        }
        if (
          entry.receiver !== state.ui &&
          entry.receiver !== state.ui.router &&
          entry.receiver !== state.ui.draggingNodePosition
        ) {
          onlyUI = false
        }
      })

      if (reset || onlyUI) {
        return
      }
      // delete redo stack if a new change came in
      if (this.state.index !== this.state.stack.length - 1) {
        this.state.stack.length = this.state.index + 1
      }
      this.state.stack.push(data)
      this.state.index = this.state.stack.length - 1
      this.setState({})
    })

    window.addEventListener('keydown', this.onKey)
  }

  onKey = e => {
    if (!e.shiftKey && e.which === 90 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
      this.goBack()
    }
    if (
      (e.which === 89 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) ||
      (e.shiftKey && e.which === 90 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey))
    ) {
      this.goForward()
    }
  }

  goBack = () => {
    const mutations = this.state.stack[this.state.index]
    if (mutations) {
      this.state.changingState = true

      mutations.forEach(data => {
        // ignore UI state
        if (data.receiver === state.ui || data.receiver === state.ui.router) {
          return
        }
        data.props.forEach(prop => {
          data.receiver[prop] = data.previous[prop]
        })
      })

      this.setState({ index: this.state.index - 1 })
    }
  }

  goForward = () => {
    const mutations = this.state.stack[this.state.index + 1]
    if (mutations) {
      this.state.changingState = true

      mutations.forEach(data => {
        // ignore UI state
        if (data.receiver == state.ui || data.receiver === state.ui.router) {
          return
        }
        data.props.forEach(prop => {
          data.receiver[prop] = data.next[prop]
        })
      })

      this.setState({ index: this.state.index + 1 })
    }
  }

  render() {
    if (this.state.disabled) {
      return null
    }

    return (
      <Root>
        <Header>
          <Button onClick={this.goBack}>Go back</Button>
          <Button onClick={this.goForward}>Go forward</Button>
        </Header>
        {this.state.stack.map(frame => (
          <Row>
            {(() => {
              const rowData = []
              frame.forEach((data, target) => rowData.push({ target, data }))
              return rowData.map(({ data }) => (
                <div>
                  {data.props.map(prop => (
                    <Line>
                      {prop} {JSON.stringify(data.previous[prop])} -> {JSON.stringify(data.next[prop])}
                    </Line>
                  ))}
                </div>
              ))
            })()}
          </Row>
        ))}
      </Root>
    )
  }
}

export default Devtools
