import * as React from 'react';
import styled from 'styled-components';
import AspectRatio from '@components/Icons/AspectRatio';

const Preview = styled.div`
  flex: 1;
  background: radial-gradient(#f7f7f7 15%, transparent 16%) 0 0, radial-gradient(#ececec 15%, transparent 16%) 8px 8px,
    radial-gradient(rgba(255, 255, 255, 0.1) 15%, transparent 20%) 0 1px,
    radial-gradient(rgba(255, 255, 255, 0.1) 15%, transparent 20%) 8px 9px;
  background-color: rgb(0, 0, 0, 0.01);
  background-size: 16px 16px;
  position: relative;
  ransform: translateZ(0);
`;
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

export default () => (
  <Preview>
    <Size>
      <Ycolumn>
        <AspectRatio />
        <Y>254</Y>
      </Ycolumn>
      <X>254</X>
    </Size>
  </Preview>
);
