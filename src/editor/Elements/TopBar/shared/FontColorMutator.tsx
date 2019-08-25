import * as React from 'react'
import { ColorBox, IconRow, InfoColumn, Title } from './_styles'
import state from '@state'
import { IconNode, TextNode } from '@src/interfaces/nodes'
import { changeProperty } from '@src/actions'
import { getSelectedNode } from '@src/utils'

const changeFontColor = (colorId: string) => () => {
  changeProperty('fontColorId', colorId)
}

const FontColorMutator = () => {
  const component = getSelectedNode() as (TextNode | IconNode)
  return (
    <>
      <InfoColumn>
        <Title>Color</Title>
        <IconRow>
          {state.settings.colors.map(color => (
            <ColorBox
              key={color.id}
              selected={component.fontColorId === color.id}
              title={color.name}
              color={color.hex}
              onClick={changeFontColor(color.id)}
            />
          ))}
        </IconRow>
      </InfoColumn>
    </>
  )
}

export default FontColorMutator
