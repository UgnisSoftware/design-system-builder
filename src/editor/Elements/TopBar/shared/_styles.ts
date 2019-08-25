import styled from 'styled-components'
import { Colors } from '@src/styles'

export const TopBarBox = styled.div`
  padding: 8px 16px;
  background: rgb(248, 248, 248);
  box-shadow: inset 0 -1px 0 0 rgb(0, 0, 0, 0.113);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  font-size: 24px;
  user-select: none;
`

export const AlignRight = styled.div`
  margin-left: auto;
  display: flex;
`

export const StylelessButton = styled.button.attrs({ type: 'button' })`
  background: none;
  color: inherit;
  border: none;
  padding: 0;
  cursor: pointer;
  outline: inherit;
`

export const Divider = styled.div`
  width: 2px;
  align-self: stretch;
  background: #dfdfdf;
  border-radius: 5px;
  margin: 0 12px 0 8px;
`

export const InfoColumn = styled.div`
  height: 48px;
  display: flex;
  flex-direction: column;
`

export const Title = styled.div`
  font-size: 14px;
  font-weight: 500;
`

export const IconRow = styled.div`
  margin: auto 0;
  display: flex;
  align-items: center;
`
export const ColorBox = styled(StylelessButton)`
  width: 20px;
  height: 20px;
  font-size: 18px;
  margin-right: 4px;
  background: ${({ color }: any) => color};
  box-shadow: ${({ selected }) => (selected ? `0px 0 5px 1px ${Colors.accent}` : 'none')};
`
