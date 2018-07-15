import * as React from 'react';
import { BoxNode, TextNode, NodeTypes, RootNode } from '@src/interfaces';
import state from '@state';
import styled from 'styled-components';

interface TextProps {
  component: TextNode;
}
const TextComponent = ({ component }: TextProps) => (
  <span style={{ fontSize: state.state.font.sizes[component.fontSize].fontSize }}>{component.text}</span>
);

interface BoxProps {
  component: BoxNode;
}
const BoxComponent = ({ component }: BoxProps) => (
  <div style={{ width: component.size.width, height: component.size.height, background: component.background.color }}>
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

interface RootProps {
  component: RootNode;
}
const RootComponent = ({ component }: RootProps) => (
  <div
    style={{
      position: 'relative',
      width: component.size.width,
      height: component.size.height,
      background: component.background.color,
    }}
  >
    <X>{component.size.width}</X>
    <Y>{component.size.height}</Y>
    {component.children.map(component => <Component component={component} />)}
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
