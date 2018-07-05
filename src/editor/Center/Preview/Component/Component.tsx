import * as React from 'react';
import { RootNode } from '@src/interfaces';

interface Props {
  component: RootNode;
}

export default ({ component }: Props) => (
  <div style={{width: component.width, height: component.height, background: 'white'}}>
  </div>
);
