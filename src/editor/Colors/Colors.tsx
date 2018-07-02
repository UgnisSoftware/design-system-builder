import * as React from 'react';
import styled from 'styled-components';

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

interface ColorsState {
  editingColorId: string;
}

class Colors extends React.Component<{}, ColorsState> {
  state = {
    editingColorId: '',
  };

  onEditingColorChange = (id: string) => () => {
    this.setState({ editingColorId: id });
  };

  render() {
    return (
      <Wrapper>
        <H1>Colors</H1>
        <ColorWrapper>
          {Object.keys(store.state.colors).map(id => (
            <ColorBoxWithPicker key={id} colorId={id} showPicker={id === this.state.editingColorId} onColorBoxClick={this.onEditingColorChange(id)} />
          ))}
          <AddColorBox>
            <PlusSign />
          </AddColorBox>
        </ColorWrapper>
      </Wrapper>
    );
  }
}

export default Colors;
