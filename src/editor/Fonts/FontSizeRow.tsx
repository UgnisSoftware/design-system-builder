import * as React from 'react';
import styled from 'styled-components';

import state from '@state';
import TextInput from '@src/components/TextInput';
import { FontSizeName } from '@src/interfaces';
import SymbolBox from '@components/SymbolBox';

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const InputWrapper = styled.div`
  display: flex;
  flex: 1 1 100%;
  margin-bottom: 20px;
`;

interface ExampleTextProps {
  fontSize: string;
  lineHeight: string;
}

const ExampleText = styled.span`
  @import url('${state.state.font.fontUrl}');
  font-family: '${state.state.font.fontName}';
  font-size: ${(props: ExampleTextProps) => props.fontSize};
  line-height: ${(props: ExampleTextProps) => props.lineHeight};
  margin-bottom: 38px;
  padding-left: 73px;
`;

interface FontSizeRowProps {
  fontSizeName: FontSizeName;
}

const onFontSizeChange = (fontSizeName: FontSizeName) => (event: React.ChangeEvent<HTMLInputElement>) => {
  state.evolveState({
    font: {
      sizes: {
        [fontSizeName]: {
          fontSize: () => event.target.value,
        },
      },
    },
  });
};

const onLineHeightChange = (fontSizeName: FontSizeName) => (event: React.ChangeEvent<HTMLInputElement>) => {
  state.evolveState({
    font: {
      sizes: {
        [fontSizeName]: {
          lineHeight: () => event.target.value,
        },
      },
    },
  });
};

const FontSizeRow = ({ fontSizeName }: FontSizeRowProps) => (
  <Wrapper>
    <InputWrapper>
      <SymbolBox>{fontSizeName}</SymbolBox>
      <TextInput
        name={`fontSize_${fontSizeName}`}
        label="Font Size"
        value={state.state.font.sizes[fontSizeName].fontSize}
        onChange={onFontSizeChange(fontSizeName)}
      />
      <TextInput
        name={`lineHeight_${fontSizeName}`}
        label="Line height"
        value={state.state.font.sizes[fontSizeName].lineHeight}
        onChange={onLineHeightChange(fontSizeName)}
      />
    </InputWrapper>
    <ExampleText
      fontSize={state.state.font.sizes[fontSizeName].fontSize}
      lineHeight={state.state.font.sizes[fontSizeName].lineHeight}
    >
      Lorem ipsum
    </ExampleText>
  </Wrapper>
);

export default FontSizeRow;
