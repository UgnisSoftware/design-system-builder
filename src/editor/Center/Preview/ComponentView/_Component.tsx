import * as React from 'react';
import { BoxNode, TextNode, NodeTypes, RootNode } from '@src/interfaces';
import state from '@state';
import styled from 'styled-components';
import * as R from 'ramda';

export const startComponentDrag = component => e => {
  e.preventDefault();
  e.persist();
  let currentX = e.touches ? e.touches[0].pageX : e.pageX;
  let currentY = e.touches ? e.touches[0].pageY : e.pageY;
  function drag(e) {
    e.preventDefault();
    const newX = e.touches ? e.touches[0].pageX : e.pageX;
    const newY = e.touches ? e.touches[0].pageY : e.pageY;
    const diffX = currentX - newX;
    const diffY = currentY - newY;
    state.evolveState({
      components: {
        [state.state.router.componentId]: {
          root: {
            children: children =>
              children.map(
                child =>
                  child.id === component.id
                    ? R.evolve({ position: { top: top => top - diffY, left: left => left - diffX } }, child)
                    : child,
              ),
          },
        },
      },
    });
    currentX = newX;
    currentY = newY;
    return false;
  }
  window.addEventListener('mousemove', drag);
  window.addEventListener('touchmove', drag);
  window.addEventListener('mouseup', stopDragging);
  window.addEventListener('touchend', stopDragging);
  function stopDragging(event) {
    event.preventDefault();
    window.removeEventListener('mousemove', drag);
    window.removeEventListener('touchmove', drag);
    window.removeEventListener('mouseup', stopDragging);
    window.removeEventListener('touchend', stopDragging);
    return false;
  }
  return false;
};

interface TextProps {
  component: TextNode;
}
const TextComponent = ({ component }: TextProps) => (
  <span
    style={{
      position: 'absolute',
      top: component.position.top,
      left: component.position.left,
      fontSize: state.state.font.sizes[component.fontSize].fontSize,
    }}
    onMouseDown={startComponentDrag(component)}
  >
    {component.text}
  </span>
);

interface BoxProps {
  component: BoxNode;
}
const BoxComponent = ({ component }: BoxProps) => (
  <div
    style={{
      position: 'absolute',
      top: component.position.top,
      left: component.position.left,
      width: component.size.width,
      height: component.size.height,
      background: component.background.color,
    }}
    onMouseDown={startComponentDrag(component)}
  >
    {component.children.map(component => <Component component={component} />)}
  </div>
);

const X = styled.div`
  position: absolute;
  left: 50%;
  top: -8px;
  transform: translateX(-50%) translateY(-100%);
`;
const Y = styled.div`
  position: absolute;
  top: 50%;
  left: -8px;
  transform: translateY(-50%) translateX(-100%);
`;

const TopDrag = styled.div`
  position: absolute;
  top: -10px;
  left: 0px;
  height: 12px;
  right: 0px;
  cursor: n-resize;
`;
const BottomDrag = styled.div`
  position: absolute;
  bottom: -10px;
  left: 0px;
  height: 12px;
  right: 0px;
  cursor: s-resize;
`;
const LeftDrag = styled.div`
  position: absolute;
  top: 0px;
  left: -10px;
  width: 12px;
  bottom: 0px;
  cursor: w-resize;
`;
const RightDrag = styled.div`
  position: absolute;
  top: 0px;
  right: -10px;
  width: 12px;
  bottom: 0px;
  cursor: e-resize;
`;

const TopLeftDrag = styled.div`
  position: absolute;
  top: -13px;
  left: -13px;
  width: 15px;
  height: 15px;
  cursor: nw-resize;
`;
const TopRightDrag = styled.div`
  position: absolute;
  top: -13px;
  right: -13px;
  width: 15px;
  height: 15px;
  cursor: ne-resize;
`;

const BottomLeftDrag = styled.div`
  position: absolute;
  bottom: -13px;
  left: -13px;
  width: 15px;
  height: 15px;
  cursor: sw-resize;
`;
const BottomRightDrag = styled.div`
  position: absolute;
  bottom: -13px;
  right: -13px;
  width: 15px;
  height: 15px;
  cursor: se-resize;
`;

enum Direction {
  N = 'N',
  NE = 'NE',
  NW = 'NW',
  W = 'W',
  E = 'E',
  S = 'S',
  SW = 'SW',
  SE = 'SE',
}

interface Size {
  width: number;
  height: number;
}

const drag = (side: Direction) => e => {
  e.preventDefault();
  e.persist();
  let currentX = e.touches ? e.touches[0].pageX : e.pageX;
  let currentY = e.touches ? e.touches[0].pageY : e.pageY;
  function drag(e) {
    e.preventDefault();
    const newX = e.touches ? e.touches[0].pageX : e.pageX;
    const newY = e.touches ? e.touches[0].pageY : e.pageY;
    const diffX = currentX - newX;
    const diffY = currentY - newY;
    state.evolveState({
      components: {
        [state.state.router.componentId]: {
          root: {
            size: (oldSize: Size) => {
              const invertDiffX = side === Direction.SE || side === Direction.NE || side === Direction.E ? -1 : 1;
              const invertDiffY = side === Direction.SE || side === Direction.SW || side === Direction.S ? -1 : 1;
              const newSize: Size = {
                width: oldSize.width + diffX * 2 * invertDiffX,
                height: oldSize.height + diffY * 2 * invertDiffY,
              };
              if (newSize.width < 0 || newSize.height < 0) {
                return oldSize;
              }
              if (side === Direction.NE || side === Direction.NW || side === Direction.SE || side === Direction.SW) {
                return {
                  width: newSize.width,
                  height: newSize.height,
                };
              }
              if (side === Direction.N || side === Direction.S) {
                return {
                  width: oldSize.width,
                  height: newSize.height,
                };
              }
              if (side === Direction.W || side === Direction.E) {
                return {
                  width: newSize.width,
                  height: oldSize.height,
                };
              }
            },
          },
        },
      },
    });
    currentX = newX;
    currentY = newY;
    return false;
  }
  window.addEventListener('mousemove', drag);
  window.addEventListener('touchmove', drag);
  function stopDragging(event) {
    event.preventDefault();
    window.removeEventListener('mousemove', drag);
    window.removeEventListener('touchmove', drag);
    window.removeEventListener('mouseup', stopDragging);
    window.removeEventListener('touchend', stopDragging);
  }
  window.addEventListener('mouseup', stopDragging);
  window.addEventListener('touchend', stopDragging);
};

interface RootProps {
  component: RootNode;
}
const RootComponent = ({ component }: RootProps) => (
  <div
    style={{
      position: 'relative',
    }}
    id="_rootComponent"
  >
    <X>{component.size.width}</X>
    <Y>{component.size.height}</Y>
    <TopDrag onMouseDown={drag(Direction.N)} />
    <LeftDrag onMouseDown={drag(Direction.W)} />
    <RightDrag onMouseDown={drag(Direction.E)} />
    <BottomDrag onMouseDown={drag(Direction.S)} />
    <TopLeftDrag onMouseDown={drag(Direction.NW)} />
    <TopRightDrag onMouseDown={drag(Direction.NE)} />
    <BottomLeftDrag onMouseDown={drag(Direction.SW)} />
    <BottomRightDrag onMouseDown={drag(Direction.SE)} />
    <div
      style={{
        position: 'relative',
        width: component.size.width,
        height: component.size.height,
        background: component.background.color,
      }}
    >
      {component.children.map(component => <Component component={component} />)}
    </div>
  </div>
);

interface Props {
  component: RootNode | BoxNode | TextNode;
}
const Component = ({ component }: Props) => {
  if (component.type === NodeTypes.Root) {
    return <RootComponent component={component} />;
  }
  if (component.type === NodeTypes.Box) {
    return <BoxComponent component={component} />;
  }
  if (component.type === NodeTypes.Text) {
    return <TextComponent component={component} />;
  }
};

export default Component;
