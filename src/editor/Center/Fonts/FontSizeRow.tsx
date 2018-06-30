import * as React from 'react';
import styled from 'styled-components';

import store from '@state';
import TextInput from '@src/components/TextInput';
import { FontSizeName } from '@src/interfaces';

interface ExampleTextProps {
  fontSize: string;
  lineHeight: string;
}

const ExampleText = styled.p`
  @import url('${store.state.font.fontUrl}');
  font-size: ${(props: ExampleTextProps) => props.fontSize};
  line-height: ${(props: ExampleTextProps) => props.lineHeight};
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
      <div className="font-size-row">
        <TextInput
          id="fontSize"
          name="fontSize"
          label="Font Size"
          value={store.state.font.sizes[this.props.fontSizeName].fontSize}
          onChange={this.onFontSizeChange(this.props.fontSizeName)}
        />
        <TextInput
          id="lineHeight"
          name="lineHeight"
          label="Line height"
          value={store.state.font.sizes[this.props.fontSizeName].lineHeight}
          onChange={this.onLineHeightChange(this.props.fontSizeName)}
        />
        <ExampleText
          fontSize={store.state.font.sizes[this.props.fontSizeName].fontSize}
          lineHeight={store.state.font.sizes[this.props.fontSizeName].lineHeight}
        >
          Lorem ipsum
        </ExampleText>
      </div>
    );
  }
}
