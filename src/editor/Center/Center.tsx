import * as React from 'react';
import styled from 'styled-components';

import TopBar from './TopBar/TopBar';
import Fonts from './Fonts/Fonts';

const Center = styled.div`
  overflow: scroll;
  padding: 0 24px;
  flex: 1 1 auto;
`;

export default () => (
  <Center>
    <TopBar />
    <Fonts />
  </Center>
);
