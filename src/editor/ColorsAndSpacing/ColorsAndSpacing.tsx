import * as React from 'react';
import styled from 'styled-components';

import store from '@state';
import H1 from '@components/H1';
import PlusSign from '@components/PlusSign';
import ColorBoxWithPicker from './ColorBoxWithPicker';
import { uuid } from '@src/editor/utils';
import SpacingSize from './SpacingSize';
import { SpacingSizeName } from '@src/interfaces';

const Wrapper = styled.div`
  padding: 24px;
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
  margin: 0 10px 16px 10px;
  vertical-align: middle;
  line-height: 45px;
  background-color: rgb(240, 240, 240);
  color: rgb(152, 161, 164);
  padding: 11px;
  transition: all 200ms ease;

  &:hover {
    background-color: rgb(232, 232, 233);
  }
`;

const SpacingWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const onAddColorClick = () => {
  const id = uuid();
  store.evolveState({
    ui: {
      editingColorId: () => id,
    },
    colors: oldColors => ({
      ...oldColors,
      [id]: { name: 'Grey', hex: '#98a1a4' },
    }),
  });
};

const ColorsAndSpacing = () => (
  <Wrapper>
    <H1>Colors</H1>
    <ColorWrapper>
      {Object.keys(store.state.colors).map(id => <ColorBoxWithPicker key={id} colorId={id} />)}
      <AddColorBox onClick={onAddColorClick}>
        <PlusSign />
      </AddColorBox>
    </ColorWrapper>

    <H1>Spacing</H1>
    <SpacingWrapper>
      <SpacingSize spacingSizeName={SpacingSizeName.XS} />
      <SpacingSize spacingSizeName={SpacingSizeName.S} />
      <SpacingSize spacingSizeName={SpacingSizeName.M} />
      <SpacingSize spacingSizeName={SpacingSizeName.L} />
      <SpacingSize spacingSizeName={SpacingSizeName.XL} />
    </SpacingWrapper>
  </Wrapper>
);

export default ColorsAndSpacing;
