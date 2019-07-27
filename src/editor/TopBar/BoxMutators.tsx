import state from '@state'
import { BoxNode, ObjectFit } from '@src/interfaces/nodes'
import * as React from 'react'
import styled from 'styled-components'
import { Colors } from '@src/styles'
import { Border, BoxShadow, ImageAsset } from '@src/interfaces/settings'
import { useState } from 'react'
import {
  ColorBox,
  Divider,
  IconRow,
  InfoColumn,
  StylelessButton,
  Title,
  TopBarBox,
} from '@src/editor/TopBar/shared/_styles'
import { changeProperty } from '@src/actions'
import StateMutator from '@src/editor/TopBar/shared/StateMutator'
import ZIndexMutator from '@src/editor/TopBar/shared/ZIndexMutator'
import { getSelectedNode } from '@src/utils'

const ImageBoxWrapper = styled.div`
  position: relative;
`

const ImageDropdown = styled.div`
  position: absolute;
  padding: 24px;
  top: 40px;
  width: 500px;
  height: 400px;
  overflow: scroll;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 2px 1px -1px rgba(0, 0, 0, 0.12);
  right: 0;
  z-index: 999999;
  background: #f8f8f8;
`

const Image = styled.img`
  object-fit: contain;
  width: 200px;
  height: 200px;
`

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, 200px);
  grid-gap: 24px;
`

const BorderBox = styled(StylelessButton)`
  border: ${({ border }) => border.style};
  border-radius: ${({ border }) => border.radius};
  background: ${({ selected }) => (selected ? Colors.accent : 'white')};
  margin-right: 4px;
  width: 20px;
  height: 20px;
`

interface BoxShadowProps {
  boxShadow: BoxShadow
}

const BoxShadowBox = styled(StylelessButton)`
  box-shadow: ${({ boxShadow }: BoxShadowProps) => boxShadow.value};
  background: ${({ selected }) => (selected ? Colors.accent : 'white')};
  margin-right: 4px;
  width: 20px;
  height: 20px;
`

const changeBackground = (colorId: string | null) => () => {
  changeProperty('backgroundImageUrl', null)
  changeProperty('backgroundColorId', colorId)
}
const changeBackgroundToImage = (image: ImageAsset) => () => {
  changeProperty('backgroundColorId', null)
  changeProperty('backgroundImageUrl', image.url)
}
const changeObjectFit = (objectFit: ObjectFit) => () => {
  changeProperty('backgroundImagePosition', objectFit)
}
const changeBorder = (border: Border) => () => {
  changeProperty('border', border.id)
}
const changeBoxShadow = (boxShadow: BoxShadow) => () => {
  changeProperty('boxShadow', boxShadow.id)
}

const ImageBox = () => {
  const [open, updateOpen] = useState(false)

  return (
    <ImageBoxWrapper>
      <div onClick={() => updateOpen(!open)}>img</div>
      {open && (
        <ImageDropdown>
          <div>
            <Title>Background Image</Title>
            <IconRow>
              <StylelessButton onClick={changeObjectFit(ObjectFit.cover)}>cover/</StylelessButton>
              <StylelessButton onClick={changeObjectFit(ObjectFit.contain)}>contain/</StylelessButton>
              <StylelessButton onClick={changeObjectFit(ObjectFit.fill)}>fill</StylelessButton>
            </IconRow>
          </div>
          <ImageGrid>
            {state.settings.images.map(img => (
              <Image src={img.url} key={img.id} onClick={changeBackgroundToImage(img)} />
            ))}
          </ImageGrid>
        </ImageDropdown>
      )}
    </ImageBoxWrapper>
  )
}

const BoxMutators = () => {
  const component = getSelectedNode() as BoxNode

  return (
    <TopBarBox>
      <ZIndexMutator />
      <InfoColumn>
        <Title>Background</Title>
        <IconRow>
          <ColorBox selected={component.backgroundColorId === null} color="#ffffff" onClick={changeBackground(null)}>
            <i className="material-icons">clear</i>
          </ColorBox>
          {state.settings.colors.map(color => (
            <ColorBox
              key={color.id}
              selected={component.backgroundColorId === color.id}
              title={color.name}
              color={color.hex}
              onClick={changeBackground(color.id)}
            />
          ))}
          <ImageBox />
        </IconRow>
      </InfoColumn>
      <Divider />
      <InfoColumn>
        <Title>Borders</Title>
        <IconRow>
          <BorderBox
            title="None"
            border={{ style: 'none', radius: 'none' }}
            selected={component.border === null}
            onClick={changeBorder(null)}
          />
          {state.settings.border.map(border => (
            <BorderBox
              key={border.id}
              selected={component.border === border.id}
              border={border}
              onClick={changeBorder(border)}
            />
          ))}
        </IconRow>
      </InfoColumn>
      <Divider />
      <InfoColumn>
        <Title>Box-Shadow</Title>
        <IconRow>
          <BoxShadowBox
            title="None"
            boxShadow={{ value: 'none' }}
            selected={component.boxShadow === null}
            onClick={changeBoxShadow(null)}
          />
          {state.settings.boxShadow.map(boxShadow => (
            <BoxShadowBox
              key={boxShadow.id}
              selected={component.boxShadow === boxShadow.id}
              boxShadow={boxShadow}
              onClick={changeBoxShadow(boxShadow)}
            />
          ))}
        </IconRow>
      </InfoColumn>
      <StateMutator />
    </TopBarBox>
  )
}

export default BoxMutators
