import { IconTypes, iconTypes } from '@src/interfaces/nodes'
import { changeProperty } from '@src/actions'
import { default as React, useState } from 'react'
import { StylelessButton } from '@src/editor/Elements/TopBar/shared/_styles'
import styled from 'styled-components'

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

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, 38px);
  grid-gap: 16px;
`

const changeIcon = (icon: IconTypes) => () => {
  changeProperty('iconType', icon)
}

const IconTypeMutator = () => {
  const [open, updateOpen] = useState(false)

  return (
    <ImageBoxWrapper>
      <StylelessButton onClick={() => updateOpen(!open)}>change icon</StylelessButton>
      {open && (
        <ImageDropdown>
          <ImageGrid>
            {Object.values(iconTypes).map(icon => (
              <StylelessButton key={icon} className="material-icons" onClick={changeIcon(icon)}>
                {icon}
              </StylelessButton>
            ))}
          </ImageGrid>
        </ImageDropdown>
      )}
    </ImageBoxWrapper>
  )
}

export default IconTypeMutator
