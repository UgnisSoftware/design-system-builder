import * as React from 'react';
import { Node } from '@src/interfaces';

interface Props {
  component: Node;
}
const Component = ({ component }: Props) => {
  return (
    <div style={{ width: component.size.width, height: component.size.height, background: component.background.color }}>
      {component.children.map(component => <Component component={component} />)}
    </div>
  );
};

export default Component;
