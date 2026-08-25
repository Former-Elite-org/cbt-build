import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  Input,
  Label,
  Form,
  FormGroup,
} from "reactstrap";
import PropTypes from "prop-types";
import { FaPhoneAlt, FaTimes } from "react-icons/fa";
import "./Videocall.css";
import drImage from "../assets/images/dr.png";
import { useNavigate } from "react-router-dom";

function VideoCall(props) {
  const { className } = props;
  const [modal, setModal] = useState(false);
  const [backdrop, setBackdrop] = useState(true);
  const [keyboard, setKeyboard] = useState(true);
  const [count, setCount] = useState(20);
  const [callData, setCallData] = useState({})

  useEffect(() => {
    props.socket.on('call_request', (data) => {
        // Show the modal with call options
        setCallRequest(data); // Set data to show in modal
        toggle()
    });
}, []);

const acceptCall = () => {
    socket.emit('call_accepted', { patientId: callRequest.patientId });
    console.log('CALL ACCEEPTED', { patientId: callRequest.patientId })
    // Additional logic to initialize video session

    setModal(!modal);
    navigate("/doctor/videocall");
}


  const toggle = () => {
    setModal(!modal);
    // navigate("/doctor/videocall");
  };

  const changeBackdrop = (e) => {
    let { value } = e.target;
    if (value !== "static") {
      value = JSON.parse(value);
    }
    setBackdrop(value);
  };

  const changeKeyboard = (e) => {
    setKeyboard(e.currentTarget.checked);
  };

  useEffect(() => {
    if (modal && count > 0) {
      const interval = setInterval(() => {
        setCount((prevCount) => prevCount - 1);
      }, 1000);

      return () => clearInterval(interval);
    } else if (count === 0 && modal) {
      toggle();
    }
  }, [modal, count]);


  // useEffect(() => {
  //   const interval = setTimeout(() => {
  //     toggle();
  //   }, 1000);

  //   return () => clearTimeout(interval);
  // }, []);

  const navigate = useNavigate();
  return (
    <div>
      <Modal
        isOpen={modal}
        toggle={toggle}
        className={`call-modal ${className}`}
        backdrop={backdrop}
        keyboard={keyboard}
      >
        <ModalBody className="text-center modal-body-custom">
          <img src={drImage} alt="Caller" className="call-image" />
          <p className="mt-3">Dr. Bash</p>
        </ModalBody>
        <ModalFooter className="justify-content-center p-5">
          <Button color="success" onClick={acceptCall} className="accept-button">
            Accept({count})
          </Button>{" "}
          <Button
            color="danger d-flex"
            onClick={toggle}
            className="decline-button"
          >
            <FaTimes className="icon" /> Decline
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

VideoCall.propTypes = {
  className: PropTypes.string,
};

export default VideoCall;
