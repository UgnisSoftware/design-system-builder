import * as React from 'react';
import styled from 'styled-components';

import store from '@state';
import H1 from '@components/H1';
import PlusSign from '@components/PlusSign';
import ColorBoxWithPicker from '@src/editor/Colors/ColorBoxWithPicker';
import { uuid } from '@src/editor/utils';

const Wrapper = styled.div`
  padding: 24px;
  overflow: scroll;
  flex: 1;
`;

const ColorWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
`;

const AddColorBox = styled.div`
  cursor: pointer;
  width: 45px;
  height: 45px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 7%;
  margin: 0 16px 16px 0;
  vertical-align: middle;
  line-height: 45px;
  background-color: rgb(240, 240, 240);
  color: rgb(152, 161, 164);
  padding: 11px;
`;

const onAddColorClick = () => {
  const id = uuid();
  store.evolveState({
    editingColorId: () => id,
    colors: () => ({
      ...store.state.colors,
      [id]: '#98a1a4',
    }),
  });
};

const Colors = () => (
  <Wrapper>
    <H1>Colors</H1>

    <ColorWrapper>
      {Object.keys(store.state.colors).map(id => <ColorBoxWithPicker key={id} colorId={id} />)}
      <AddColorBox onClick={onAddColorClick}>
        <PlusSign />
      </AddColorBox>
    </ColorWrapper>
  </Wrapper>
);

export default Colors;
