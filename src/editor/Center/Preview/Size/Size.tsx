import * as React from 'react';
import styled from 'styled-components';
import AspectRatio from '@components/Icons/AspectRatio';
import { RootNode } from '@src/interfaces';

const Size = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  padding: 16px;
  font-size: 20px;
  display: flex;
`;

const Ycolumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const X = styled.div`
  display: inline-block;
  margin-left: 8px;
`;
const Y = styled.div`
  margin-top: 10px;
`;

interface Props {
  component: RootNode;
}

export default ({ component }: Props) => (
  <Size>
    <Ycolumn>
      <AspectRatio />
      <Y>{component.height}</Y>
    </Ycolumn>
    <X>{component.width}</X>
  </Size>
);
