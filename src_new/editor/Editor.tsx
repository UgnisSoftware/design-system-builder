import * as React from 'react';
import styled from 'styled-components';

import LeftMenu from './LeftMenu/LeftMenu';
import Center from './Center/Center';
import RightMenu from './RightMenu/RightMenu';

const Root = styled.div`
  display: flex;
  height: 100%;
`;

const Editor = () => {
  return (
    <Root>
      <LeftMenu />
      <Center />
      <RightMenu />
    </Root>
  );
};

export default Editor;
