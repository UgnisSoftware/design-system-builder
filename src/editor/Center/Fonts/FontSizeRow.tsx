import * as React from 'react';
import styled from 'styled-components';

import store from '@state';
import TextInput from '@src/components/TextInput';
import { FontSizeName } from '@src/interfaces';

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const InputWrapper = styled.div`
  display: flex;
  flex: 1 1 100%;
  margin-bottom: 20px;
`;

const SymbolBox = styled.span`
  border: 2px solid rgba(0, 0, 0, 0.15);
  width: 45px;
  height: 45px;
  display: flex;
  justify-content: center;
  border-radius: 7%;
  margin-right: 24px;
  vertical-align: middle;
  line-height: 45px;
`;

interface ExampleTextProps {
  fontSize: string;
  lineHeight: string;
}

const ExampleText = styled.span`
  @import url('${store.state.font.fontUrl}');
  font-family: '${store.state.font.fontName}';
  font-size: ${(props: ExampleTextProps) => props.fontSize};
  line-height: ${(props: ExampleTextProps) => props.lineHeight};
  margin-bottom: 38px;
  padding-left: 73px;
`;

interface FontSizeRowProps {
  fontSizeName: FontSizeName;
}

export default class FontSizeRow extends React.Component<FontSizeRowProps> {
  onFontSizeChange = (fontSizeName: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    store.evolveState({
      font: {
        sizes: {
          [fontSizeName]: {
            fontSize: () => event.target.value,
          },
        },
      },
    });
  };

  onLineHeightChange = (fontSizeName: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    store.evolveState({
      font: {
        sizes: {
          [fontSizeName]: {
            lineHeight: () => event.target.value,
          },
        },
      },
    });
  };

  render() {
    return (
      <Wrapper>
        <InputWrapper>
          <SymbolBox>{this.props.fontSizeName}</SymbolBox>
          <TextInput
            name={`fontSize_${this.props.fontSizeName}`}
            label="Font Size"
            value={store.state.font.sizes[this.props.fontSizeName].fontSize}
            onChange={this.onFontSizeChange(this.props.fontSizeName)}
          />
          <TextInput
            name={`lineHeight_${this.props.fontSizeName}`}
            label="Line height"
            value={store.state.font.sizes[this.props.fontSizeName].lineHeight}
            onChange={this.onLineHeightChange(this.props.fontSizeName)}
          />
        </InputWrapper>
        <ExampleText
          fontSize={store.state.font.sizes[this.props.fontSizeName].fontSize}
          lineHeight={store.state.font.sizes[this.props.fontSizeName].lineHeight}
        >
          Lorem ipsum
        </ExampleText>
      </Wrapper>
    );
  }
}
