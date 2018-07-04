import * as React from 'react';
import styled from 'styled-components';

import store from '@state';
import { RouterPaths } from '@src/interfaces';

import Fonts from './Fonts/Fonts';
import LeftMenu from './LeftMenu/LeftMenu';
import Center from './Center/Center';
import RightMenu from './RightMenu/RightMenu';
import ColorsAndSpacing from './ColorsAndSpacing/ColorsAndSpacing';

const Root = styled.div`
  display: flex;
  height: 100%;
`;

const Editor = () => {
  return (
    <Root>
      <LeftMenu />
      {store.state.router.path === RouterPaths.colors && <ColorsAndSpacing />}
      {store.state.router.path === RouterPaths.fonts && <Fonts />}
      {store.state.router.path === RouterPaths.component && (
        <>
          <Center />
          <RightMenu />
        </>
      )}
    </Root>
  );
};

export default Editor;
