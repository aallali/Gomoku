import React, { useEffect, useState } from "react"
import { Button, Modal, Form } from 'react-bootstrap';

export default function Menu({ isClicked }: any) {
    const [show, setShow] = useState(true);
    const [thinkTime, setThinkTime] = useState<number>(0.5)
    const [color, setColor] = useState<string>('bw')
    const handleClose = () => {
        setShow(false);
        isClicked()

    }
    const getFormMode = (e: any) => {
        const [captureMove, endinGCapture, forbiddenDoubleThree, fiveInRow] = Array.from(e.currentTarget)
        // fiveInRow = !fiveInRow ? 
        console.log(fiveInRow.checked)
        if (!fiveInRow.checked && !endinGCapture.checked)
            fiveInRow.checked = true
         
    }
    useEffect(() => {
        console.log(color)
    }, [color])
    const handleShow = () => setShow(true);
    return (<>
        <Modal
            show={show}
            onHide={handleClose}
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>Initiate your options</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h5>Mode:</h5>
                <Form onChange={getFormMode}>
                    <Form.Check
                        type="radio"
                        name="group1"
                        label="player vs player (local)"
                        value={1}
                    />
                    <Form.Check
                        type="radio"
                        name="group1"
                        label="player vs player (online)"
                        value={2}
                    />
                    <Form.Check
                        type="radio"
                        name="group1"
                        label="player vs ai"
                        value={3}
                        defaultChecked={true}
                    />
                    <Form.Check
                        type="radio"
                        name="group1"
                        label="ai vs ai"
                        value={4}
                       

                    />
                </Form>
                <br />
                <h5>Rules:</h5>
                <Form onChange={getFormMode}>
                    <Form.Check
                        type="switch"
                        label="Capture Move"
                        value={1}

                    />
                    <Form.Check
                        type="switch"
                        label="Ending Game Capture (10 captures to win)"
                        value={2}
                    />
                    <Form.Check
                        type="switch"
                        label="Forbidden Double Free Three"
                        value={3}
                    />
                    <Form.Check
                        type="switch"
                        label="Five in a Row to win"
                        value={4}
                        defaultChecked={true}
                    />
                </Form>
                <br />
                <h5>Costumize:</h5>
                <h6>color:</h6>
                <Form.Check
                    type="radio"
                    id="solo"
                    name="group3"
                    label="Red & Blue"
                    checked={color === "rb"}
                    onChange={() => (setColor('rb'))}
                />
                <Form.Check
                    type="radio"
                    id="solo"
                    name="group3"
                    label="Black & White"
                    checked={color === "bw"}
                    onChange={() => (setColor('bw'))}
                />
                <br />
                <h6>AI Thinking Time:</h6>
                <div>
                    <input
                        id="thinkingTme"
                        type="range"
                        min="0" max="10"
                        value={thinkTime}
                        onChange={(e) => setThinkTime(parseFloat(e.target.value) > 0 ? parseFloat(e.target.value) : 0.5)}
                        step="0.5" />
                    <label htmlFor="thinkingTme"> [{thinkTime}] seconds</label>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary">Play</Button>
            </Modal.Footer>
        </Modal>
    </>)
}