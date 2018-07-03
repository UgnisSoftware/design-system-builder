import * as React from 'react';
import styled from 'styled-components';
import { ChromePicker } from 'react-color';
import ClickOutside from 'react-click-outside';

import store from '@state';

const Wrapper = styled.div`
  position: relative;
`;

interface ColorBoxProps {
  color: string;
}

const ColorBox = styled.div`
  cursor: pointer;
  width: 65px;
  height: 65px;
  border-radius: 7%;
  margin: 0 16px 16px 0;
  background-color: ${(props: ColorBoxProps) => props.color};
`;

const PickerWrapper = styled.div`
  z-index: 1;
  position: absolute;
  bottom: 10px;
  transform: translateY(100%);
`;

interface ColorBoxWithPickerProps {
  colorId: string;
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

const onEditingColorChange = id => () => {
  store.evolveState({ editingColorId: () => id });
};

const onClickOutside = () => {
  store.evolveState({ editingColorId: () => '' });
};

const onColorChange = (colorId: string) => (color: Color) => {
  store.evolveState({
    colors: {
      [colorId]: () => color.hex,
    },
  });
};

const ColorBoxWithPicker = ({ colorId }: ColorBoxWithPickerProps) => (
  <Wrapper>
    <ColorBox color={store.state.colors[colorId]} onClick={onEditingColorChange(colorId)} />
    {store.state.editingColorId === colorId && (
      <ClickOutside onClickOutside={onClickOutside}>
        <PickerWrapper>
          <ChromePicker color={store.state.colors[colorId]} onChange={onColorChange(colorId)} />
        </PickerWrapper>
      </ClickOutside>
    )}
  </Wrapper>
);

export default ColorBoxWithPicker;
