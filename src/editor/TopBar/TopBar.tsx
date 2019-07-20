import * as React from 'react'
import styled from 'styled-components'
import state from '@state'
import { Border, BoxShadow, FontSizeName, ImageAsset } from '@src/interfaces/settings'
import { Colors } from '@src/styles'
import { ComponentStateMenu } from '@src/interfaces/ui'
import { Alignment, BoxNode, NodeTypes, ObjectFit, TextNode } from '@src/interfaces/nodes'
import { getSelectedElement } from '@src/selector'
import { useState } from 'react'
import Select from '@components/Select'

const TopBarBox = styled.div`
  padding: 8px 16px;
  background: rgb(248, 248, 248);
  box-shadow: inset 0 -1px 0 0 rgb(0, 0, 0, 0.113);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  font-size: 24px;
  user-select: none;
`

const AlignRight = styled.div`
  margin-left: auto;
  display: flex;
`

const StylelessButton = styled.button.attrs({ type: 'button' })`
  background: none;
  color: inherit;
  border: none;
  padding: 0;
  cursor: pointer;
  outline: inherit;
`

const Divider = styled.div`
  width: 2px;
  align-self: stretch;
  background: #dfdfdf;
  border-radius: 5px;
  margin: 0 12px 0 8px;
`

const ColorBox = styled(StylelessButton)`
  width: 20px;
  height: 20px;
  font-size: 18px;
  margin-right: 4px;
  background: ${({ color }: any) => color};
  box-shadow: ${({ selected }) => (selected ? `0px 0 5px 1px ${Colors.accent}` : 'none')};
`

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
  box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14),
    0px 2px 1px -1px rgba(0, 0, 0, 0.12);
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
              <StylelessButton onClick={selectObjectFit(ObjectFit.cover)}>cover/</StylelessButton>
              <StylelessButton onClick={selectObjectFit(ObjectFit.contain)}>contain/</StylelessButton>
              <StylelessButton onClick={selectObjectFit(ObjectFit.fill)}>fill</StylelessButton>
            </IconRow>
          </div>
          <ImageGrid>
            {state.settings.images.map(img => (
              <Image src={img.url} key={img.id} onClick={selectImage(img)} />
            ))}
          </ImageGrid>
        </ImageDropdown>
      )}
    </ImageBoxWrapper>
  )
}

const HorizontalAlignmentWrapper = styled.div`
  cursor: pointer;
  display: grid;
  grid-template-columns: 6px 6px 6px;
  grid-template-rows: 18px;
  margin-right: 8px;
`

const VerticalAlignmentWrapper = styled.div`
  display: grid;
  grid-template-columns: 18px;
  grid-template-rows: 6px 6px 6px;
  margin-right: 8px;
`

const AlignmentItem = styled.div`
  background: ${Colors.grey200};
`

const AlignmentItemSelected = styled(AlignmentItem)`
  background: ${({ selected }) => (selected ? Colors.accent : Colors.grey500)};
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

const InfoColumn = styled.div`
  height: 48px;
  display: flex;
  flex-direction: column;
`

const Title = styled.div`
  font-size: 14px;
  font-weight: 500;
`

const IconRow = styled.div`
  margin: auto 0;
  display: flex;
  align-items: center;
`

const FontSize = styled.div`
  margin-right: 8px;
  font-size: 18px;
`

const moveLayer = (by: number) => () => {
  const node = state.ui.selectedNode
  const children = getSelectedElement().root.children
  const fromIndex = children.indexOf(node)
  const toIndex = fromIndex + by
  // out of bounds
  if (toIndex < 0 || toIndex > children.length) {
    return
  }
  children.splice(fromIndex, 1)
  children.splice(toIndex, 0, node)
}

const changeBackground = (colorId: string | null, stateManager?: ComponentStateMenu) => () => {
  if (stateManager) {
    state.ui.selectedNode.states[stateManager].backgroundImageUrl = null
    state.ui.selectedNode.states[stateManager].backgroundColorId = colorId
    return
  }
  ;(state.ui.selectedNode as BoxNode).backgroundImageUrl = null
  ;(state.ui.selectedNode as BoxNode).backgroundColorId = colorId
}
const changeFontColor = (colorId: string, stateManager?: ComponentStateMenu) => () => {
  if (stateManager) {
    state.ui.selectedNode.states[stateManager].fontColorId = colorId
    return
  }
  ;(state.ui.selectedNode as TextNode).fontColorId = colorId
}

const removeBorder = (stateManager?: ComponentStateMenu) => () => {
  if (stateManager) {
    state.ui.selectedNode.states[stateManager].border = null
    return
  }
  ;(state.ui.selectedNode as BoxNode).border = null
}
const changeBorder = (border: Border, stateManager?: ComponentStateMenu) => () => {
  if (stateManager) {
    state.ui.selectedNode.states[stateManager].border = border.id
    return
  }
  ;(state.ui.selectedNode as BoxNode).border = border.id
}
const removeBoxShadow = (stateManager?: ComponentStateMenu) => () => {
  if (stateManager) {
    state.ui.selectedNode.states[stateManager].boxShadow = null
    return
  }
  ;(state.ui.selectedNode as BoxNode).boxShadow = null
}
const changeBoxShadow = (boxShadow: BoxShadow, stateManager?: ComponentStateMenu) => () => {
  if (stateManager) {
    state.ui.selectedNode.states[stateManager].boxShadow = boxShadow.id
    return
  }
  ;(state.ui.selectedNode as BoxNode).boxShadow = boxShadow.id
}

const selectHorizontalAlignment = (alignment: Alignment, stateManager?: ComponentStateMenu) => () => {
  if (stateManager) {
    state.ui.selectedNode.states[stateManager].alignment = {
      ...state.ui.selectedNode.states[stateManager].alignment,
      horizontal: alignment,
    }
    return
  }
  state.ui.selectedNode.alignment.horizontal = alignment
}
const selectVerticalAlignment = (alignment: Alignment, stateManager?: ComponentStateMenu) => () => {
  if (stateManager) {
    state.ui.selectedNode.states[stateManager].alignment = {
      ...state.ui.selectedNode.states[stateManager].alignment,
      horizontal: alignment,
    }
    return
  }
  state.ui.selectedNode.alignment.vertical = alignment
}

/* const changeFontFamily = (fontFamily = string, stateManager?: ComponentStateMenu) => () => {
  if (stateManager) {
    state.ui.selectedNode.states[stateManager].fontFamily = fontFamily
    return
  }
  state.ui.selectedNode.fontFamily = fontFamily
} fix this nonsense?*/

const selectImage = (image: ImageAsset, stateManager?: ComponentStateMenu) => () => {
  const url = image.url
  if (stateManager) {
    state.ui.selectedNode.states[stateManager].backgroundImageUrl = url
    state.ui.selectedNode.states[stateManager].backgroundColorId = null
    return
  }
  ;(state.ui.selectedNode as BoxNode).backgroundColorId = null
  ;(state.ui.selectedNode as BoxNode).backgroundImageUrl = url
}

const selectObjectFit = (objectFit: ObjectFit, stateManager?: ComponentStateMenu) => () => {
  if (stateManager) {
    state.ui.selectedNode.states[stateManager].backgroundImagePosition = objectFit
    return
  }
  ;(state.ui.selectedNode as BoxNode).backgroundImagePosition = objectFit
}
const changeFontSize = (size: FontSizeName, stateManager?: ComponentStateMenu) => () => {
  if (stateManager) {
    state.ui.selectedNode.states[stateManager].fontSize = size
    return
  }
  ;(state.ui.selectedNode as TextNode).fontSize = size
}
const changeFontFamily = (stateManager?: ComponentStateMenu) => (fontFamilyId: string) => {
  if (stateManager) {
    state.ui.selectedNode.states[stateManager].fontFamilyId = fontFamilyId
    return
  }
  ;(state.ui.selectedNode as TextNode).fontFamilyId = fontFamilyId
}

const DefaultValue = 'Default'
const changeState = (componentState: ComponentStateMenu) => {
  if (componentState === DefaultValue) {
    state.ui.stateManager = null
    return
  }
  state.ui.stateManager = componentState
}

const changeGrid = () => {
  state.ui.showGrid = !state.ui.showGrid
}

const showExportMenu = () => {
  state.ui.showExportMenu = !state.ui.showExportMenu
}

const ZIndexMutators = () => (
  <>
    <InfoColumn>
      <Title>Z index</Title>
      <IconRow>
        <StylelessButton title="Move to front" className="material-icons" onClick={moveLayer(1)}>
          flip_to_front
        </StylelessButton>
        <StylelessButton title="Move to back" className="material-icons" onClick={moveLayer(-1)}>
          flip_to_back
        </StylelessButton>
      </IconRow>
    </InfoColumn>
    <Divider />
  </>
)
const NodeStateMutators = () => (
  <AlignRight>
    <Divider />
    <InfoColumn>
      <Title>State</Title>
      <IconRow>
        <Select
          value={state.ui.stateManager}
          placeholder="Default"
          onChange={changeState}
          options={[DefaultValue].concat(Object.keys(state.ui.selectedNode.states))}
        />
      </IconRow>
    </InfoColumn>
  </AlignRight>
)

interface BoxMutatorProps {
  stateManager?: ComponentStateMenu
  component: BoxNode
}

const BoxMutators = ({ component, stateManager }: BoxMutatorProps) => (
  <TopBarBox>
    <ZIndexMutators />
    <InfoColumn>
      <Title>Background</Title>
      <IconRow>
        <ColorBox
          selected={component.backgroundColorId === null}
          color="#ffffff"
          onClick={changeBackground(null, stateManager)}
        >
          <i className="material-icons">clear</i>
        </ColorBox>
        {state.settings.colors.map(color => (
          <ColorBox
            key={color.id}
            selected={component.backgroundColorId === color.id}
            title={color.name}
            color={color.hex}
            onClick={changeBackground(color.id, stateManager)}
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
          onClick={removeBorder(stateManager)}
        />
        {state.settings.border.map(border => (
          <BorderBox
            key={border.id}
            selected={component.border === border.id}
            border={border}
            onClick={changeBorder(border, stateManager)}
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
          onClick={removeBoxShadow(stateManager)}
        />
        {state.settings.boxShadow.map(boxShadow => (
          <BoxShadowBox
            key={boxShadow.id}
            selected={component.boxShadow === boxShadow.id}
            boxShadow={boxShadow}
            onClick={changeBoxShadow(boxShadow, stateManager)}
          />
        ))}
      </IconRow>
    </InfoColumn>
    <NodeStateMutators />
  </TopBarBox>
)
interface TextMutatorProps {
  stateManager?: ComponentStateMenu
  component: TextNode
}

const TextMutators = ({ component, stateManager }: TextMutatorProps) => (
  <TopBarBox>
    <ZIndexMutators />
    <InfoColumn>
      <Title>Horizontal</Title>
      <IconRow>
        <StylelessButton title="Stretch" onClick={selectHorizontalAlignment(Alignment.stretch, stateManager)}>
          <HorizontalAlignmentWrapper>
            <AlignmentItemSelected selected={component.alignment.horizontal === Alignment.stretch} />
            <AlignmentItemSelected selected={component.alignment.horizontal === Alignment.stretch} />
            <AlignmentItemSelected selected={component.alignment.horizontal === Alignment.stretch} />
          </HorizontalAlignmentWrapper>
        </StylelessButton>
        <StylelessButton title="Left" onClick={selectHorizontalAlignment(Alignment.start, stateManager)}>
          <HorizontalAlignmentWrapper>
            <AlignmentItemSelected selected={component.alignment.horizontal === Alignment.start} />
            <AlignmentItem />
            <AlignmentItem />
          </HorizontalAlignmentWrapper>
        </StylelessButton>
        <StylelessButton title="Middle" onClick={selectHorizontalAlignment(Alignment.center, stateManager)}>
          <HorizontalAlignmentWrapper>
            <AlignmentItem />
            <AlignmentItemSelected selected={component.alignment.horizontal === Alignment.center} />
            <AlignmentItem />
          </HorizontalAlignmentWrapper>
        </StylelessButton>
        <StylelessButton title="Right" onClick={selectHorizontalAlignment(Alignment.end, stateManager)}>
          <HorizontalAlignmentWrapper>
            <AlignmentItem />
            <AlignmentItem />
            <AlignmentItemSelected selected={component.alignment.horizontal === Alignment.end} />
          </HorizontalAlignmentWrapper>
        </StylelessButton>
      </IconRow>
    </InfoColumn>
    <Divider />
    <InfoColumn>
      <Title>Vertical</Title>
      <IconRow>
        <StylelessButton title="Stretch" onClick={selectVerticalAlignment(Alignment.stretch, stateManager)}>
          <VerticalAlignmentWrapper>
            <AlignmentItemSelected selected={component.alignment.vertical === Alignment.stretch} />
            <AlignmentItemSelected selected={component.alignment.vertical === Alignment.stretch} />
            <AlignmentItemSelected selected={component.alignment.vertical === Alignment.stretch} />
          </VerticalAlignmentWrapper>
        </StylelessButton>
        <StylelessButton title="Top" onClick={selectVerticalAlignment(Alignment.start, stateManager)}>
          <VerticalAlignmentWrapper>
            <AlignmentItemSelected selected={component.alignment.vertical === Alignment.start} />
            <AlignmentItem />
            <AlignmentItem />
          </VerticalAlignmentWrapper>
        </StylelessButton>
        <StylelessButton title="Middle" onClick={selectVerticalAlignment(Alignment.center, stateManager)}>
          <VerticalAlignmentWrapper>
            <AlignmentItem />
            <AlignmentItemSelected selected={component.alignment.vertical === Alignment.center} />
            <AlignmentItem />
          </VerticalAlignmentWrapper>
        </StylelessButton>
        <StylelessButton title="Bottom" onClick={selectVerticalAlignment(Alignment.end, stateManager)}>
          <VerticalAlignmentWrapper>
            <AlignmentItem />
            <AlignmentItem />
            <AlignmentItemSelected selected={component.alignment.vertical === Alignment.end} />
          </VerticalAlignmentWrapper>
        </StylelessButton>
      </IconRow>
    </InfoColumn>
    <Divider />
    <InfoColumn>
      <Title>Color</Title>
      <IconRow>
        {state.settings.colors.map(color => (
          <ColorBox
            key={color.id}
            selected={component.fontColorId === color.id}
            title={color.name}
            color={color.hex}
            onClick={changeFontColor(color.id, stateManager)}
          />
        ))}
      </IconRow>
    </InfoColumn>
    <Divider />
    <InfoColumn>
      <Title>Font size</Title>
      <IconRow>
        <StylelessButton title="XS" onClick={changeFontSize(FontSizeName.XS, stateManager)}>
          <FontSize>XS</FontSize>
        </StylelessButton>
        <StylelessButton title="S" onClick={changeFontSize(FontSizeName.S, stateManager)}>
          <FontSize>S</FontSize>
        </StylelessButton>
        <StylelessButton title="M" onClick={changeFontSize(FontSizeName.M, stateManager)}>
          <FontSize>M</FontSize>
        </StylelessButton>
        <StylelessButton title="L" onClick={changeFontSize(FontSizeName.L, stateManager)}>
          <FontSize>L</FontSize>
        </StylelessButton>
        <StylelessButton title="XL" onClick={changeFontSize(FontSizeName.XL, stateManager)}>
          <FontSize>XL</FontSize>
        </StylelessButton>
      </IconRow>
    </InfoColumn>
    <Divider />
    <InfoColumn>
      <Title>Font family</Title>
      <IconRow>
        <Select
          options={state.settings.fonts.map(font => font.id)}
          value={component.fontFamilyId}
          toName={id => state.settings.fonts.find(font => font.id === id).fontFamily}
          onChange={changeFontFamily(stateManager)}
        />
      </IconRow>
    </InfoColumn>
    <NodeStateMutators />
  </TopBarBox>
)

interface IconMutatorProps {
  stateManager?: ComponentStateMenu
  component: TextNode
}

const IconMutators = ({ component, stateManager }: IconMutatorProps) => (
  <TopBarBox>
    <ZIndexMutators />
    <InfoColumn>
      <Title>Color</Title>
      <IconRow>
        {state.settings.colors.map(color => (
          <ColorBox
            key={color.id}
            selected={component.fontColorId === color.id}
            title={color.name}
            color={color.hex}
            onClick={changeFontColor(color.id, stateManager)}
          />
        ))}
      </IconRow>
    </InfoColumn>
    <Divider />
    <InfoColumn>
      <Title>Font size</Title>
      <IconRow>
        <StylelessButton title="XS" onClick={changeFontSize(FontSizeName.XS, stateManager)}>
          <FontSize>XS</FontSize>
        </StylelessButton>
        <StylelessButton title="S" onClick={changeFontSize(FontSizeName.S, stateManager)}>
          <FontSize>S</FontSize>
        </StylelessButton>
        <StylelessButton title="M" onClick={changeFontSize(FontSizeName.M, stateManager)}>
          <FontSize>M</FontSize>
        </StylelessButton>
        <StylelessButton title="L" onClick={changeFontSize(FontSizeName.L, stateManager)}>
          <FontSize>L</FontSize>
        </StylelessButton>
        <StylelessButton title="XL" onClick={changeFontSize(FontSizeName.XL, stateManager)}>
          <FontSize>XL</FontSize>
        </StylelessButton>
      </IconRow>
    </InfoColumn>
    <NodeStateMutators />
  </TopBarBox>
)

const ElementMutators = ({  }: IconMutatorProps) => (
  <TopBarBox>
    <InfoColumn>TODO Overrides</InfoColumn>
  </TopBarBox>
)

const NoneSelectedMutators = () => {
  return (
    <TopBarBox>
      {state.ui.showAddComponentMenu && 'Click and drag'}
      <InfoColumn style={{ marginLeft: 'auto' }}>
        <Title>Edit Grid</Title>
        <IconRow>
          <StylelessButton
            title="Show grid"
            className="material-icons"
            style={{
              fontSize: '24px',
              marginLeft: 'auto',
              marginRight: 'auto',
              color: state.ui.showGrid ? ' rgb(83, 212, 134)' : 'black',
            }}
            onClick={changeGrid}
          >
            {state.ui.showGrid ? 'grid_on' : 'grid_off'}
          </StylelessButton>
        </IconRow>
      </InfoColumn>
      <Divider />
      <InfoColumn>
        <Title>Export</Title>
        <IconRow>
          <StylelessButton
            title="Show export menu"
            className="material-icons"
            style={{
              fontSize: '28px',
              marginLeft: 'auto',
              marginRight: 'auto',
              marginTop: '2px',

              color: state.ui.showExportMenu ? ' rgb(83, 212, 134)' : 'black',
            }}
            onClick={showExportMenu}
          >
            exit_to_app
          </StylelessButton>
        </IconRow>
      </InfoColumn>
    </TopBarBox>
  )
}

const TopBar = () => {
  const stateManager = state.ui.stateManager
  if (!state.ui.selectedNode) {
    return <NoneSelectedMutators />
  }
  const component = stateManager
    ? { ...state.ui.selectedNode, ...state.ui.selectedNode.states[stateManager] }
    : state.ui.selectedNode
  if (state.ui.selectedNode.type === NodeTypes.Element) {
    return <ElementMutators stateManager={stateManager} component={component} />
  }
  if (state.ui.selectedNode.type === NodeTypes.Box) {
    return <BoxMutators stateManager={stateManager} component={component} />
  }
  if (component.type === NodeTypes.Text) {
    return <TextMutators stateManager={stateManager} component={component} />
  }
  if (component.type === NodeTypes.Icon) {
    return <IconMutators stateManager={stateManager} component={component} />
  }
  return null
}

export default TopBar
