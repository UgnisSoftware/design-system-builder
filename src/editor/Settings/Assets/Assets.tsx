import React from 'react'
import styled from 'styled-components'
import H1 from '@src/editor/components/H1'
import PlusSign from '@src/editor/components/PlusSign'
import { Colors } from '@src/styles'
import stateSettings from '@state/settings'
import { uuid } from '@src/utils'
import { ImageAsset } from '@src/interfaces/settings'

const Wrapper = styled.div`
  padding: 24px;
  flex: 1;
  overflow: scroll;
  max-height: 100vh;
`

const AddBox = styled.div`
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 7%;
  margin-left: 10px;
  vertical-align: middle;
  line-height: 45px;
  background-color: rgb(240, 240, 240);
  color: rgb(152, 161, 164);
  padding: 8px;
  transition: all 200ms ease;

  &:hover {
    background-color: ${Colors.accent};
    color: white;
  }
`

const Image = styled.img`
  object-fit: contain;
  width: 250px;
  height: 250px;
`
const ImagesWrapper = styled.div`
  display: grid;
  grid-gap: 32px;
  grid-template-columns: repeat(auto-fit, 250px);
`

const Input = styled.input`
  outline: 0;
  border: none;
  padding-bottom: 5px;
  transition: all 200ms ease;
  width: 250px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;

  &:hover {
    box-shadow: inset 0 -2px 0 0 rgba(0, 0, 0, 0.35);
  }

  &:focus {
    box-shadow: inset 0 -2px 0 0 rgba(0, 0, 0, 0.85);
  }
`

const onUrlChange = (image: ImageAsset) => (e) => {
  image.url = e.target.value
}

const onDeleteImage = (image: ImageAsset) => () => {
  stateSettings.images.splice(stateSettings.images.indexOf(image), 1)
}

const onAddImage = () => {
  const newId = uuid()
  stateSettings.images.unshift({
    id: newId,
    url: 'https://ugnis.com/images/logo.png',
  })
}

const Assets = () => (
  <Wrapper>
    <H1>
      Images
      <AddBox onClick={onAddImage}>
        <PlusSign />
      </AddBox>
    </H1>
    <ImagesWrapper>
      {stateSettings.images.map((img) => (
        <div key={img.id}>
          <div onClick={onDeleteImage(img)}>
            <i className="material-icons">clear</i>
          </div>
          <Image src={img.url} key={img.id} />
          <Input type="text" placeholder="Url" id={img.id} name={img.id} value={img.url} onChange={onUrlChange(img)} />
        </div>
      ))}
    </ImagesWrapper>
  </Wrapper>
)

export default Assets
