import * as React from 'react';
import styled from 'styled-components';

import TopBar from './TopBar/TopBar';
import Fonts from './Fonts/Fonts';

const Center = styled.div`
  box-shadow: rgba(0, 0, 0, 0.12) 2px 2px 2px;
  padding: 0 24px;
  flex: 1 1 auto;
`;

export default () => (
  <Center>
    <TopBar />
    <Fonts />
  </Center>
);
