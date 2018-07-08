import * as React from 'react';
import { Node } from '@src/interfaces';

interface Props {
  component: Node;
}

export default ({ component }: Props) => (
  <div style={{width: component.size.width, height: component.size.height, background: '#49c67f'}}>
  </div>
);
