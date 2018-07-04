import React from 'react';
import styled from 'styled-components';

import SymbolBox from '@components/SymbolBox';
import { SpacingSizeName } from '@src/interfaces';
import store from '@state';
import TextInput from '@components/TextInput';

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

interface SpacingSizeProps {
  spacingSizeName: SpacingSizeName;
}

const onSpacingSizeChange = (spacingSizeName: SpacingSizeName) => (event: React.ChangeEvent<HTMLInputElement>) => {
  store.evolveState({
    spacing: {
      [spacingSizeName]: () => event.target.value,
    },
  });
};

const SpacingSize = ({ spacingSizeName }: SpacingSizeProps) => (
  <Wrapper>
    <SymbolBox>{spacingSizeName}</SymbolBox>
    <TextInput
      name={`spacingSize_${spacingSizeName}`}
      label="Spacing Size"
      value={store.state.spacing[spacingSizeName]}
      onChange={onSpacingSizeChange(spacingSizeName)}
    />
  </Wrapper>
);

export default SpacingSize;