import * as React from 'react'
import styled from 'styled-components'
import state from '@state'
import { Alignment, NodeTypes, ObjectFit, Overflow } from '@src/interfaces'
import { uuid } from '@src/utils'
import { FontSizeName } from '@src/Interfaces/fonts'
import { Units } from '@src/Interfaces/node'

const Menu = styled.div`
  background: rgb(244, 244, 244);
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 500px;
  padding: 24px;
`

const Title = styled.div`
  padding-bottom: 8px;
  display: flex;
  transition: all 250ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;
  opacity: 0;
`

const Box = styled.div`
  background: #90ccf4;
  width: 160px;
  height: 100px;
`

const Image = styled.img`
  width: 160px;
  height: 100px;
  object-fit: cover;
`

const ComponentWrapper = styled.div`
  padding-bottom: 24px;
  display: flex;
  flex-direction: column-reverse;
  position: relative;

  &:hover ${Title} {
    opacity: 1;
  }
`

const Text = styled.span`
  font-size: 38px;
`

const images = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/NASA_Unveils_Celestial_Fireworks_as_Official_Hubble_25th_Anniversary_Image.jpg/1280px-NASA_Unveils_Celestial_Fireworks_as_Official_Hubble_25th_Anniversary_Image.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Ciri_Cosplay_%28The_Witcher_3_Wild_Hunt%29_%E2%80%A2_2.jpg/1024px-Ciri_Cosplay_%28The_Witcher_3_Wild_Hunt%29_%E2%80%A2_2.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/13-08-31-Kochtreffen-Wien-RalfR-N3S_7849-024.jpg/1280px-13-08-31-Kochtreffen-Wien-RalfR-N3S_7849-024.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/India_-_Varanasi_green_peas_-_2714.jpg/1280px-India_-_Varanasi_green_peas_-_2714.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Sadhu_V%C3%A2r%C3%A2nas%C3%AE.jpg/1280px-Sadhu_V%C3%A2r%C3%A2nas%C3%AE.jpg',
]

let randomId = Math.floor(Math.random() * images.length)
const regenerateRandomId = () => (randomId = Math.floor(Math.random() * images.length))
regenerateRandomId()

const addComponent = (type: NodeTypes) => (event: React.MouseEvent & React.TouchEvent) => {
  event.stopPropagation()
  event.persist()
  const box = (event.target as HTMLDivElement).getBoundingClientRect()
  const newId = uuid()

  // state.components[state.ui.router.componentId].nodes.push(newNode)
  let currentX = event.touches ? event.touches[0].pageX : event.pageX
  let currentY = event.touches ? event.touches[0].pageY : event.pageY

  state.ui.showAddComponentMenu = false
  state.ui.addingAtom = {
    type: type,
    position: {
      x: currentX - 200 - (currentX - box.left),
      y: currentY - 64 - (currentY - box.top),
    },
    imageUrl: images[randomId],
  }

  function drag(e) {
    e.preventDefault()
    const newX = e.touches ? e.touches[0].pageX : e.pageX
    const newY = e.touches ? e.touches[0].pageY : e.pageY
    const diffX = currentX - newX
    const diffY = currentY - newY
    state.ui.addingAtom.position.y -= diffY
    state.ui.addingAtom.position.x -= diffX
    currentX = newX
    currentY = newY
    return false
  }
  window.addEventListener('mousemove', drag)
  window.addEventListener('touchmove', drag)
  window.addEventListener('mouseup', stopDragging)
  window.addEventListener('touchend', stopDragging)
  function stopDragging(event) {
    event.preventDefault()

    if (state.ui.hoveredCell) {
      const baseComponent = {
        id: newId,
        type: state.ui.addingAtom.type,
        position: {
          columnStart: state.ui.hoveredCell.colIndex + 1,
          columnEnd: state.ui.hoveredCell.colIndex + 2,
          rowStart: state.ui.hoveredCell.rowIndex + 1,
          rowEnd: state.ui.hoveredCell.rowIndex + 2,
        },
        padding: {
          top: '0px',
          left: '0px',
          bottom: '0px',
          right: '0px',
        },
        alignment: {
          horizontal: Alignment.stretch,
          vertical: Alignment.stretch,
        },
        overflow: Overflow.visible,
        columns: [
          {
            value: 1,
            unit: Units.Fr,
          },
        ],
        rows: [
          {
            value: 1,
            unit: Units.Fr,
          },
        ],
        hover: {},
        focus: {},
      }
      if (state.ui.addingAtom.type === NodeTypes.Box) {
        state.ui.hoveredCell.component.children.push({
          ...baseComponent,
          children: [],
          background: {
            colorId: 'dddd-4444',
          },
        })
      }
      if (state.ui.addingAtom.type === NodeTypes.Text) {
        state.ui.hoveredCell.component.children.push({
          ...baseComponent,
          text: 'Hello',
          fontSize: FontSizeName.L,
        })
      }
      if (state.ui.addingAtom.type === NodeTypes.Image) {
        state.ui.hoveredCell.component.children.push({
          ...baseComponent,
          children: [],
          imageUrl: images[randomId],
          objectFit: ObjectFit.cover,
        })
        regenerateRandomId()
      }
      // select new node
      state.ui.selectedNode =
        state.ui.hoveredCell.component.children[state.ui.hoveredCell.component.children.length - 1]
    }
    state.ui.addingAtom = null
    state.ui.hoveredCell = null
    window.removeEventListener('mousemove', drag)
    window.removeEventListener('touchmove', drag)
    window.removeEventListener('mouseup', stopDragging)
    window.removeEventListener('touchend', stopDragging)
    return false
  }
  return false
}

export default () => {
  return (
    <Menu>
      <ComponentWrapper>
        <Box onMouseDown={addComponent(NodeTypes.Box)} />
        <Title>Box</Title>
      </ComponentWrapper>
      <ComponentWrapper>
        <Text onMouseDown={addComponent(NodeTypes.Text)}>Hello</Text>
        <Title>Text</Title>
      </ComponentWrapper>
      <ComponentWrapper>
        <Image src={images[randomId]} onMouseDown={addComponent(NodeTypes.Image)} />
        <Title>Image</Title>
      </ComponentWrapper>
    </Menu>
  )
}
