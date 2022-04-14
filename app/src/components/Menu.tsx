import React, { useState, useCallback } from "react"
import { Button, Modal, Form } from 'react-bootstrap';
import { setOptions } from "../store/actionCreators"
import { Dispatch } from "redux"
import { useDispatch } from "react-redux"
export default function Menu({ isClicked }: any) {
    const dispatch: Dispatch<any> = useDispatch()
    const [show, setShow] = useState(true);

    const [mode, setMode] = useState<number>(3)
    const [rules, setRules] = useState<any>({
        captureMove: true,
        endinGCapture: false,
        forbiddenDoubleThree: false,
        fiveInRow: true
    })
    const [color, setColor] = useState<string>('bw')
    const [thinkTime, setThinkTime] = useState<number>(1)
    const [moveTime, setMoveTime] = useState<number>(60)

    const setGameOptions = useCallback(
        (options: Object) => dispatch(setOptions(options)),
        [dispatch]
    )
    const handleClose = () => {
        setShow(false);
        isClicked()

    }
    const getFormMode = (e: any) => {
        setMode(e.target.value > 0 && e.target.value < 5 ? e.target.value : 3)
    }
    const getFormRules = (e: any) => {
        const [captureMove, endinGCapture, forbiddenDoubleThree, fiveInRow] = Array.from(e.currentTarget)
        if (!fiveInRow.checked && !endinGCapture.checked)
            fiveInRow.checked = true

        setRules({
            captureMove: captureMove.checked,
            endinGCapture: endinGCapture.checked,
            forbiddenDoubleThree: forbiddenDoubleThree.checked,
            fiveInRow: fiveInRow.checked
        })

        return false
    }

    function handlePlayButton() {

        setGameOptions({ mode, rules, color, thinkTime, moveTime })
        handleClose()

    }
    return (<>
        <Modal
            show={show}
            onHide={handleClose}
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header>
                <Modal.Title>Initiate your options</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h5>Mode:</h5>
                <Form onChange={getFormMode}>
                    <Form.Check
                        type="radio"
                        name="group1"
                        label="Player vs Player (local)"
                        value={1}
                    />
                    <Form.Check
                        type="radio"
                        name="group1"
                        label="Player vs Player (online) (currently not available)"
                        value={2}
                        disabled
                    />
                    <Form.Check
                        type="radio"
                        name="group1"
                        label="Player vs AI"
                        value={3}
                        defaultChecked={true}
                    />
                    <Form.Check
                        type="radio"
                        name="group1"
                        label="AI vs AI"
                        value={4}
                    />
                </Form>
                <br />
                <h5>Rules:</h5>
                <Form onChange={getFormRules}>
                    <Form.Check
                        type="switch"
                        label="Capture Move"
                        value={1}
                        defaultChecked={rules.captureMove}

                    />
                    <Form.Check
                        type="switch"
                        label="Ending Game Capture (10 captures to win)"
                        value={2}
                        defaultChecked={rules.endinGCapture}
                    />
                    <Form.Check
                        type="switch"
                        label="Forbidden Double Free Three"
                        value={3}
                        defaultChecked={rules.forbiddenDoubleThree}
                    />
                    <Form.Check
                        type="switch"
                        label="Five in a Row to win"
                        value={4}
                        defaultChecked={rules.fiveInRow}
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
                        step="0.5"
                        disabled={!('34'.includes(mode.toString()))} />
                    <label htmlFor="thinkingTme" style={{ paddingLeft: '9px' }}>{thinkTime} seconds</label>
                </div>
                <h6>Time per move:</h6>
                <div>
                    <input
                        id="thinkingTme"
                        type="range"
                        min="30" max="180"
                        value={moveTime}
                        onChange={(e) => setMoveTime(parseFloat(e.target.value))}
                        step="30" />
                    <label htmlFor="thinkingTme" style={{ paddingLeft: '9px' }}>{moveTime / 60} minutes ({moveTime}s)</label>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handlePlayButton} variant="primary">Play</Button>
            </Modal.Footer>
        </Modal>
    </>)
}