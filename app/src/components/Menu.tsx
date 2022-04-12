import React, { useState } from "react"
import { Button, Modal} from 'react-bootstrap';

export default function Menu({isClicked}:any) {
    const [show, setShow] = useState(true);
   
    const handleClose = () =>{
        setShow(false);
        isClicked()
   
    }
    const handleShow = () => setShow(true);
    return (<>
        <Modal
            show={show}
            onHide={handleClose}
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>Modal title</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                I will not close if you click outside me. Don't even try to press
                escape key.
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary">Understood</Button>
            </Modal.Footer>
        </Modal>
    </>)
}