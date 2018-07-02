import * as React from 'react';
import styled from 'styled-components';
import { ChromePicker } from 'react-color';

import store from '@state';

const Wrapper = styled.div`
  position: relative;
`;

interface ColorBoxProps {
  color: string;
}

const ColorBox = styled.div`
  width: 65px;
  height: 65px;
  border-radius: 7%;
  margin: 0 16px 16px 0;
  background-color: ${(props: ColorBoxProps) => props.color};
`;

interface PickerWrapperProps {
  showPicker: boolean;
}

const PickerWrapper = styled.div`
  background: #fff;
  border: 0 solid rgba(0, 0, 0, 0.25);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  position: absolute;
  bottom: 10px;
  transform: translateY(100%);

  ${(props: PickerWrapperProps) =>
    !props.showPicker &&
    `
      display: none;
    `};
`;

interface ColorBoxWithPickerProps {
  colorId: string;
  showPicker: boolean;
  onColorBoxClick: () => void;
}

interface Color {
  hex: string;
  rgb: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
  hsl: {
    h: number;
    s: number;
    l: number;
    a: number;
  };
}

export default class ColorBoxWithPicker extends React.Component<ColorBoxWithPickerProps> {
  onColorChange = (colorId: string) => (color: Color) => {
    store.evolveState({
      colors: {
        [colorId]: () => color.hex,
      },
    });
  };

  render() {
    return (
      <Wrapper>
        <ColorBox color={store.state.colors[this.props.colorId]} onClick={this.props.onColorBoxClick} />
        <PickerWrapper showPicker={this.props.showPicker}>
          <ChromePicker
            color={store.state.colors[this.props.colorId]}
            onChange={this.onColorChange(this.props.colorId)}
          />
        </PickerWrapper>
      </Wrapper>
    );
  }
}
