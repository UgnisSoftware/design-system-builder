import * as React from 'react';
import styled from 'styled-components';

const TopBar = styled.div`
  padding: 16px;
  background: rgb(0, 0, 0, 0.028);
  box-shadow: inset 0 -1px 0 0 rgb(0, 0, 0, 0.113);
  flex: 0 0 50px;
`;

export default () => <TopBar></TopBar>;
