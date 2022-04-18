import React, { memo, useCallback } from "react";

import styled from "styled-components";

const Col = styled.div<{ $row: any, $col: any }>`
  width: 40px;
  height: 40px;
   
  position: relative;

  &:before {
    content: "";
    height: 100%;
    width: 1px;
    background: black;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);

    ${(props: any) =>
    props.$row === 0 &&
    `
      top: 50%;
    `}

    ${(props: any) =>
    props.$row === 18 &&
    `
      height: 50%;
    `}
  }

  &:after {
    content: "";
    width: 100%;
    height: 1px;
    background: black;
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);

    ${(props: any) =>
    props.$col === 0 &&
    `
      left: 50%;
    `}

    ${(props: any) =>
    props.$col === 18 &&
    `
      width: 50%;
    `}
  }
`;

const ChessElement = styled.div<{ $value: any }>`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: absolute;
  transform: scale(0.85);
  padding-top:6px;
  text-align:center;
  top: 0;
  left: 0;
  z-index: 1;
  :hover {
    transform: scale(0.85);
    background-color: rgba(220,220,220, 0.4);
    border:solid 1px black;
   }
  
  ${(props: any) =>
    props.$value === "b" &&
    `
    background-color: #000000;
    background-image: linear-gradient(315deg, #000000 0%, #414141 74%);
  `}

  ${(props: any) =>
    props.$value === "w" &&
    `
    background-color: #b8c6db;
    background-image: linear-gradient(315deg, #b8c6db 0%, #f5f7fa 74%);
  `}

  ${(props: any) =>
    props.$value === "r" &&
    `
    background-color #3f0d12;
    background-image linear-gradient(315deg, #3f0d12 0%, #a71d31 74%);
  `}
  ${(props: any) =>
    props.$value === "bl" &&
    `
    background-color: #045de9;
    background-image: linear-gradient(315deg, #045de9 0%, #09c6f9 74%);
  `}
  
`;
const Dot = styled.div<{ $value: any }>`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: absolute;
  transform: scale(0.15);
  top: 0;
  left: 0;
  z-index: 1;
  background-color: black;
  :hover {
    transform: scale(0.85);
    background-color: rgba(220,220,220, 0.4);
    border:solid 1px black;
  }
`;

const CordT = styled.div`
    position: absolute;
    top: -70%;
    left: 45%;
    transform: translateX(-50%);  
    font-size : 17px;
    font-weight : bold;
`
const CordL = styled.div`
    position: absolute;
    top: 10%;
    right: 120%;
    font-size : 17px;
    font-weight : bold;
    text-align:left
`
const Chess = ({ colors, row, col, value, onClick, order }: { colors: { enemy: string, current: string }, row: number, col: number, value: string | null, onClick: Function , order:number}) => {

  const color = value ? (value === 'b' ? colors.current : colors.enemy) : ''

  const dots = ['44', '414', '144', '1414', '99', '914', '94', '49', '149']
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const handleClick = useCallback(() => {
    onClick(row, col, value);
  }, [row, col, value, onClick]);

  return (
    <Col $row={row} $col={col}   onClick={handleClick}>
      {
        dots.includes(`${row}${col}`) && !value ?
          (<Dot $value={color} />) :
          (<ChessElement $value={color}>
            {!row ? (<CordT> {alpha[col]} </CordT>) : null}
            {!col ? (<CordL> {row} </CordL>) : null}
            {value ?  (<i style={{color:value === 'b' ? 'white' : 'black', fontSize:'12px'}}>{order}</i>) : null}
          </ChessElement>)
      }

    </Col>
  );
};

export default memo(Chess);
