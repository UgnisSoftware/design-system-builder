import * as React from 'react';
import { BoxNode, TextNode, NodeTypes, RootNode } from '@src/interfaces';
import state from "@state";

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

interface RootProps {
  component: RootNode;
}
const RootComponent = ({ component }: RootProps) => (
  <div style={{ width: component.size.width, height: component.size.height, background: component.background.color }}>
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
