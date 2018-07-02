import * as React from 'react';
import styled from 'styled-components';
import { ChromePicker } from 'react-color';

import store from '@state';
import H1 from '@components/H1';
import PlusSign from '@components/PlusSign';
import ColorBoxWithPicker from '@src/editor/Colors/ColorBoxWithPicker';

const Wrapper = styled.div`
  padding: 24px;
  overflow: scroll;
  flex: 1;
`;

const ColorWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
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

const AddColorBox = styled.div`
  width: 65px;
  height: 65px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 7%;
  margin: 0 16px 16px 0;
  vertical-align: middle;
  line-height: 45px;
  background-color: rgba(0, 0, 0, 0.15);
  color: #898989;
  padding: 9px;
`;

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

interface ColorsState {
  editingColorId: string
}

class Colors extends React.Component<{}, ColorsState> {
  state = {
    editingColorId: '',
  };

  onEditingColorChange = (id: string) => {
    this.setState({ editingColorId: id });
  };

  render() {
    return (
      <Wrapper>
        <H1>Colors</H1>
        <ColorWrapper>
          {Object.entries(store.state.colors).map(([id, hexValue]) => <ColorBox key={id} color={hexValue} />)}
          <ColorBoxWithPicker colorId="vava-1823" />
          <AddColorBox>
            <PlusSign />
          </AddColorBox>
        </ColorWrapper>
        {/*<ChromePicker color={store.state.colors['vava-1823']} onChange={this.onColorChange('vava-1823')} />*/}
      </Wrapper>
    );
  }
}

export default Colors;
