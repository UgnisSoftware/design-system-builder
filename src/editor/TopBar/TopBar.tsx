import * as React from 'react'
import styled from 'styled-components'
import state from '@state'
import {
  Alignment,
  Border,
  BoxShadow,
  ComponentView,
  FontSizeName,
  NodeTypes,
  ObjectFit,
  Overflow,
} from '../../interfaces'
import { Colors } from '../../styles'

const TopBarBox = styled.div`
  padding: 8px 16px;
  background: rgb(248, 248, 248);
  box-shadow: inset 0 -1px 0 0 rgb(0, 0, 0, 0.113);
  display: flex;
  align-items: center;
  font-size: 24px;
  user-select: none;
  height: 64px;
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
  width: 3px;
  height: 85%;
  flex: 0 0 2px;
  background: #dfdfdf;
  border-radius: 5px;
  margin: 0 12px 0 8px;
`

const ColorBox = styled(StylelessButton)`
  width: 20px;
  height: 20px;
  margin-right: 4px;
  background: ${({ color }: any) => color};
`

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
  background: ${({ selected }) => (selected ? Colors.accent : Colors.grey)};
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
const selectComponentView = (view: ComponentView) => () => {
  state.ui.componentView = view
}

const changeBackground = (colorId: string) => () => {
  state.ui.selectedNode.background.colorId = colorId
}

const removeBorder = () => () => {
  state.ui.selectedNode.border = null
}
const changeBorder = (border: Border) => () => {
  state.ui.selectedNode.border = border.id
}
const removeBoxShadow = () => () => {
  state.ui.selectedNode.boxShadow = null
}
const changeBoxShadow = (boxShadow: BoxShadow) => () => {
  state.ui.selectedNode.boxShadow = boxShadow.id
}
const changeOverflow = (overflow: Overflow) => () => {
  state.ui.selectedNode.overflow = overflow
}

const selectHorizontalAlignment = (alignment: Alignment) => () => {
  state.ui.selectedNode.alignment.horizontal = alignment
}
const selectVerticalAlignment = (alignment: Alignment) => () => {
  state.ui.selectedNode.alignment.vertical = alignment
}

const selectObjectFit = (objectFit: ObjectFit) => () => {
  state.ui.selectedNode.objectFit = objectFit
}
const changeFontSize = (size: FontSizeName) => () => {
  state.ui.selectedNode.fontSize = size
}

const TopBar = () => (
  <TopBarBox>
    <InfoColumn>
      <Title>View</Title>
      <IconRow>
        <StylelessButton
          title="Normal"
          className="material-icons"
          style={{
            fontSize: '28px',
            marginLeft: '-6px',
            color: state.ui.componentView === ComponentView.Center ? ' rgb(83, 212, 134)' : 'black',
          }}
          onClick={selectComponentView(ComponentView.Center)}
        >
          stop
        </StylelessButton>
        <StylelessButton
          title="Layers"
          className="material-icons"
          style={{
            fontSize: '24px',
            marginLeft: '-2px',
            marginRight: '2px',
            transform: 'rotateZ(40deg)',
            color: state.ui.componentView === ComponentView.Tilted ? ' rgb(83, 212, 134)' : 'black',
          }}
          onClick={selectComponentView(ComponentView.Tilted)}
        >
          layers
        </StylelessButton>
      </IconRow>
    </InfoColumn>

    {state.ui.selectedNode && (
      <>
        {state.ui.selectedNode.type === NodeTypes.Box && (
          <>
            <Divider />
            <InfoColumn>
              <Title>Background</Title>
              <IconRow>
                {Object.keys(state.colors).map(colorIndex => (
                  <ColorBox
                    title={state.colors[colorIndex].name}
                    color={state.colors[colorIndex].hex}
                    onClick={changeBackground(state.colors[colorIndex].id)}
                  />
                ))}
              </IconRow>
            </InfoColumn>
            <Divider />
            <InfoColumn>
              <Title>Borders</Title>
              <IconRow>
                <BorderBox
                  title="None"
                  border={{ style: 'none', radius: 'none' }}
                  selected={state.ui.selectedNode.border === null}
                  onClick={removeBorder()}
                />
                {state.border.map(border => (
                  <BorderBox
                    selected={state.ui.selectedNode.border === border.id}
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
                  selected={state.ui.selectedNode.boxShadow === null}
                  onClick={removeBoxShadow()}
                />
                {state.boxShadow.map(boxShadow => (
                  <BoxShadowBox
                    selected={state.ui.selectedNode.boxShadow === boxShadow.id}
                    boxShadow={boxShadow}
                    onClick={changeBoxShadow(boxShadow)}
                  />
                ))}
              </IconRow>
            </InfoColumn>
            <Divider />
            <InfoColumn>
              <Title>Overflow</Title>
              <IconRow>
                <StylelessButton
                  title="Visible"
                  className="material-icons"
                  style={{
                    fontSize: '28px',
                    color: state.ui.selectedNode.overflow === Overflow.visible ? ' rgb(83, 212, 134)' : 'black',
                  }}
                  onClick={changeOverflow(Overflow.visible)}
                >
                  visibility
                </StylelessButton>
                <StylelessButton
                  title="Hidden"
                  className="material-icons"
                  style={{
                    fontSize: '28px',
                    color: state.ui.selectedNode.overflow === Overflow.hidden ? ' rgb(83, 212, 134)' : 'black',
                  }}
                  onClick={changeOverflow(Overflow.hidden)}
                >
                  visibility_off
                </StylelessButton>
              </IconRow>
            </InfoColumn>
          </>
        )}

        {state.ui.selectedNode.type === NodeTypes.Text && (
          <>
            <Divider />
            <InfoColumn>
              <Title>Horizontal</Title>
              <IconRow>
                <StylelessButton title="Stretch" onClick={selectHorizontalAlignment(Alignment.stretch)}>
                  <HorizontalAlignmentWrapper>
                    <AlignmentItemSelected
                      selected={state.ui.selectedNode.alignment.horizontal === Alignment.stretch}
                    />
                    <AlignmentItemSelected
                      selected={state.ui.selectedNode.alignment.horizontal === Alignment.stretch}
                    />
                    <AlignmentItemSelected
                      selected={state.ui.selectedNode.alignment.horizontal === Alignment.stretch}
                    />
                  </HorizontalAlignmentWrapper>
                </StylelessButton>
                <StylelessButton title="Left" onClick={selectHorizontalAlignment(Alignment.start)}>
                  <HorizontalAlignmentWrapper>
                    <AlignmentItemSelected selected={state.ui.selectedNode.alignment.horizontal === Alignment.start} />
                    <AlignmentItem />
                    <AlignmentItem />
                  </HorizontalAlignmentWrapper>
                </StylelessButton>
                <StylelessButton title="Middle" onClick={selectHorizontalAlignment(Alignment.center)}>
                  <HorizontalAlignmentWrapper>
                    <AlignmentItem />
                    <AlignmentItemSelected selected={state.ui.selectedNode.alignment.horizontal === Alignment.center} />
                    <AlignmentItem />
                  </HorizontalAlignmentWrapper>
                </StylelessButton>
                <StylelessButton title="Right" onClick={selectHorizontalAlignment(Alignment.end)}>
                  <HorizontalAlignmentWrapper>
                    <AlignmentItem />
                    <AlignmentItem />
                    <AlignmentItemSelected selected={state.ui.selectedNode.alignment.horizontal === Alignment.end} />
                  </HorizontalAlignmentWrapper>
                </StylelessButton>
              </IconRow>
            </InfoColumn>
            <Divider />
            <InfoColumn>
              <Title>Vertical</Title>
              <IconRow>
                <StylelessButton title="Stretch" onClick={selectVerticalAlignment(Alignment.stretch)}>
                  <VerticalAlignmentWrapper>
                    <AlignmentItemSelected selected={state.ui.selectedNode.alignment.vertical === Alignment.stretch} />
                    <AlignmentItemSelected selected={state.ui.selectedNode.alignment.vertical === Alignment.stretch} />
                    <AlignmentItemSelected selected={state.ui.selectedNode.alignment.vertical === Alignment.stretch} />
                  </VerticalAlignmentWrapper>
                </StylelessButton>
                <StylelessButton title="Top" onClick={selectVerticalAlignment(Alignment.start)}>
                  <VerticalAlignmentWrapper>
                    <AlignmentItemSelected selected={state.ui.selectedNode.alignment.vertical === Alignment.start} />
                    <AlignmentItem />
                    <AlignmentItem />
                  </VerticalAlignmentWrapper>
                </StylelessButton>
                <StylelessButton title="Middle" onClick={selectVerticalAlignment(Alignment.center)}>
                  <VerticalAlignmentWrapper>
                    <AlignmentItem />
                    <AlignmentItemSelected selected={state.ui.selectedNode.alignment.vertical === Alignment.center} />
                    <AlignmentItem />
                  </VerticalAlignmentWrapper>
                </StylelessButton>
                <StylelessButton title="Bottom" onClick={selectVerticalAlignment(Alignment.end)}>
                  <VerticalAlignmentWrapper>
                    <AlignmentItem />
                    <AlignmentItem />
                    <AlignmentItemSelected selected={state.ui.selectedNode.alignment.vertical === Alignment.end} />
                  </VerticalAlignmentWrapper>
                </StylelessButton>
              </IconRow>
            </InfoColumn>
            <Divider />
            <InfoColumn>
              <Title>Font size</Title>
              <IconRow>
                <StylelessButton title="XS" onClick={changeFontSize(FontSizeName.XS)}>
                  <FontSize>XS</FontSize>
                </StylelessButton>
                <StylelessButton title="S" onClick={changeFontSize(FontSizeName.S)}>
                  <FontSize>S</FontSize>
                </StylelessButton>
                <StylelessButton title="M" onClick={changeFontSize(FontSizeName.M)}>
                  <FontSize>M</FontSize>
                </StylelessButton>
                <StylelessButton title="L" onClick={changeFontSize(FontSizeName.L)}>
                  <FontSize>L</FontSize>
                </StylelessButton>
                <StylelessButton title="XL" onClick={changeFontSize(FontSizeName.XL)}>
                  <FontSize>XL</FontSize>
                </StylelessButton>
              </IconRow>
            </InfoColumn>
          </>
        )}

        {state.ui.selectedNode.type === NodeTypes.Image && (
          <>
            <Divider />
            <InfoColumn>
              <Title>Scale</Title>
              <IconRow>
                <StylelessButton onClick={selectObjectFit(ObjectFit.cover)}>cover/</StylelessButton>
                <StylelessButton onClick={selectObjectFit(ObjectFit.contain)}>contain/</StylelessButton>
                <StylelessButton onClick={selectObjectFit(ObjectFit.fill)}>fill</StylelessButton>
              </IconRow>
            </InfoColumn>
            <Divider />
          </>
        )}
      </>
    )}
  </TopBarBox>
)

export default TopBar
