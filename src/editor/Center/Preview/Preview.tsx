import * as React from 'react'
import styled from 'styled-components'
import state from '@state'
import AddComponentMenu from './AddComponentMenu/AddComponentMenu'
import Component from '@src/editor/Center/Preview/ComponentView/_Component'
import { connect } from 'lape'
import { ComponentView } from '@src/interfaces'
import Background from '@src/editor/Center/Preview/Background'

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex: 1;
`

const PreviewBox = styled.div`
  flex: 1;
  filter: ${() => (state.ui.showAddComponentMenu ? 'blur(10px) saturate(0.8)' : 'none')};
  overflow: hidden;
  perspective: 1000px;
`

const ScaleBox = styled.div`
  transform: ${() => `translateZ(0) scale(${state.ui.zoom / 100})`};
`
const PerspectiveBox = styled.div`
  position: relative;
  transition: transform 0.3s;
  transform: ${() => (state.ui.componentView === ComponentView.Tilted ? `rotateY(30deg) rotateX(30deg)` : 'none')};
`

const PositionBox = styled.div`
  position: absolute;
`

const Preview = () => {
  const component = state.components[state.router.componentId]
  return (
    <Wrapper>
      <PreviewBox>
        <Background />
        <ScaleBox>
          <PerspectiveBox>
            <PositionBox
              style={{
                top: `${state.ui.screenPosition.y}px`,
                left: `${state.ui.screenPosition.x}px`,
              }}
            >
              {component.nodes.map(node => (
                <Component component={node} />
              ))}
            </PositionBox>
          </PerspectiveBox>
        </ScaleBox>
      </PreviewBox>
      {state.ui.showAddComponentMenu && <AddComponentMenu />}
    </Wrapper>
  )
}

export default connect(Preview)
