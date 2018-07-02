import * as React from 'react';
import styled from 'styled-components';

import store from '@state';

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

const Card = styled.div`
  width: 200px;
  background: #fff;
  border: 0 solid rgba(0, 0, 0, 0.25);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  position: relative;
`;

const Triangle = styled.div`
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 9px 10px 9px;
  border-color: transparent transparent #fff transparent;
  position: absolute;
`;

const TriangleShadow = styled.div`
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 9px 10px 9px;
  border-color: transparent transparent rgba(0, 0, 0, 0.1) transparent;
  position: absolute;
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
      <>
        <ColorBox color={store.state.colors[this.props.colorId]} />
        <Card>
          <Triangle />
          <TriangleShadow />
        </Card>
      </>
    );
  }
}
