import React, { useEffect, useCallback, useState } from "react";
import Gomoku from "./Gomoku";
import Menu from "./Menu"
import styled from "styled-components";
import { Button, Row, Container, Col } from 'react-bootstrap';
import { useSelector, shallowEqual } from "react-redux"

const Title = styled.h1`
  color: #333;
  text-align: center;
  flex:row;
`;


export default function App() {
  const [showModal, setShowModal] = useState(true);
  /**
   * Menu :
   * 1 - Mode : 1v1 - 1vai - aiVai
   * 2 - Turn : Black or White
   * 3 - Black Points : 0
   * 4 - White Points : 0
   * 5 - view suggestions : button (onOff)
   * 6 - invit player
   */

  const currntPlayer: string = useSelector(
    (state: GomokuState) => state.currentPlayer,
    shallowEqual
  )
    function isClicked() {
      setShowModal(prev => !prev)
    }
  return (
    <div>
      {
        showModal ? (<Menu isClicked={isClicked}/>) : ( 
         
          <Container>
          <Row className="justify-content-lg-center">
          <Title>Gomoku (allali)</Title>
            <Col>
              <Gomoku />
            </Col>
  
            <Col>
              <div className="menu">
                <h3>Menu</h3>
                <Row gap={3}>
                  <Col><div className="ticket">Mode</div></Col>
                  <Col className="mb-1"><div className="ticket"> Solo</div></Col>
                </Row>
                <Row>
                  <Col><div className="ticket">Turn</div></Col>
                  <Col className="mb-1"><div className="ticket"> {currntPlayer}</div></Col>
                </Row>
                <Row>
                  <Col><div className="ticket">Black Pnts.</div></Col>
                  <Col className="mb-1"><div className="ticket"> 0</div></Col>
                </Row>
                <Row>
                  <Col><div className="ticket">White Pnts.</div></Col>
                  <Col className="mb-1"><div className="ticket"> 5</div></Col>
                </Row>
  
                <Row>
                  <Col><div className="ticket">View Hints</div></Col>
                  <Col><Button className="py-1">View</Button></Col>
                </Row>
  
  
              </div>
  
            </Col>
          </Row>
        </Container>)
      }
     
      
  
    </div >
  );
}
