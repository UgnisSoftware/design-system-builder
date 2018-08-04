import * as React from 'react';
import styled from 'styled-components';
import state from '@state';

const Menu = styled.div`
  position: absolute;
  top: 0;
  left: 0;
`;

export default () => {

  return <Menu>{
    Object.keys(state.state.components).map(componentId => <span>{state.state.components[componentId].name}</span>)
  }</Menu>;
};
