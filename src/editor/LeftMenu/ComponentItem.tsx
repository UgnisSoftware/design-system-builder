import * as React from 'react';
import styled, { css } from 'styled-components';
import ClickOutside from 'react-click-outside';

import state from '@state';
import { RouterPaths } from '@src/interfaces';
import TextInput from '@components/TextInput';
import {route} from "@src/editor/actions";
import {view} from "react-easy-state/dist/es.es6";

interface ItemProps {
  selected?: boolean;
}
export const Item = styled.div`
  font-size: 16px;
  font-weight: 300;
  display: flex;
  vertical-align: middle;
  line-height: 40px;
  align-items: center;
  height: 40px;
  transition: background 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;
  padding-left: 24px;
  cursor: pointer;
  &:hover {
    background: rgb(232, 232, 233);
  }
  ${(props: ItemProps) =>
    props.selected &&
    css`
      background: rgb(219, 219, 219);
      border-right: 3px solid rgb(83, 212, 134);
    `};
`;

const Input = styled(TextInput)`
  padding-left: 24px;
  font-weight: 300;
  height: 40px;
  padding-top: 3px;
  display: flex;
  justify-content: center;
  background: rgb(232, 232, 233);
  border-right: 3px solid rgb(83, 212, 134);
`;

interface Props {
  id: string;
}

interface State {
  name: string;
  isEditingName: boolean;
}

class ComponentItem extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      name: state.components[this.props.id].name,
      isEditingName: false,
    };
  }

  edit = () => {
    this.setState({ isEditingName: true });
  };

  save = () => {
    if (this.state.name) {
      state.components[this.props.id].name = this.state.name
      this.setState({ isEditingName: false });
    } else {
      this.closeWithoutSaving();
    }
  };

  closeWithoutSaving = () => {
    this.setState({
      name: state.components[this.props.id].name,
      isEditingName: false,
    });
  };

  componentDidMount() {
    document.addEventListener('keydown', this.maybeSave);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.maybeSave);
  }

  maybeSave = e => {
    const ENTER = 13;
    const ESCAPE = 27;
    if (e.keyCode === ENTER) {
      this.save();
    }
    if (e.keyCode === ESCAPE) {
      this.closeWithoutSaving();
    }
  };

  updateName = e => {
    this.setState({ name: e.target.value });
  };

  render() {
    const id = this.props.id;
    const component = state.components[id];

    if (this.state.isEditingName) {
      return (
        <ClickOutside onClickOutside={this.save}>
          <Input value={this.state.name} name="AddComponent" autoFocus={true} onChange={this.updateName} />
        </ClickOutside>
      );
    }
    return (
      <Item
        onClick={route(RouterPaths.component, id)}
        selected={state.router.componentId === id}
        onDoubleClick={this.edit}
      >
        {component.name}
      </Item>
    );
  }
}

export default view(ComponentItem);
