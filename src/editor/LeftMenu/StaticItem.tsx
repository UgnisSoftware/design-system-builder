import * as React from 'react'
import styled, { css } from 'styled-components'

import { Colors } from '@src/styles'

interface ItemProps {
  selected?: boolean
}
export const Item = styled.div`
  font-size: 16px;
  font-weight: 400;
  color: ${Colors.grey900};
  line-height: 40px;
  height: 40px;
  transition: background 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;
  padding-left: 32px;
  cursor: pointer;
  &:hover {
    background: rgb(238, 238, 238);
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

interface Props {
  name: string
  selected: boolean
  onClick: () => void
}

class StaticItem extends React.Component<Props> {
  render() {
    return (
      <Item onClick={this.props.onClick} selected={this.props.selected}>
        {this.props.name}
      </Item>
    )
  }
}

export default StaticItem
