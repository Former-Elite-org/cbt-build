"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardFooter,
  Form,
  FormGroup,
  Input,
  Button,
  Label,
  Spinner,
} from "reactstrap";
import {
  FaUser,
  FaLock,
  FaSignInAlt,
  FaGraduationCap,
  FaChalkboardTeacher,
} from "react-icons/fa";
import { motion } from "framer-motion";
import "./login.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { login } from "../../redux/actions/auth";
import { useDispatch } from "react-redux";
import startupIcon from "../../assets/startupIcon.png";
import appLogo from "../../assets/app-logo.png";
import cbtbase from "../../assets/cbtbase.png";
import { _get, short_name } from "../../Helper";

export default function Login() {
  const _form = {
    school_id: "",
    email: "",
    password: "",
  };
  const [loading, setLoading] = useState(false);
  const [isSchoolLoading, setIsSchoolLoading] = useState(false);
  const [form, setForm] = useState(_form);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isStudentLogin, setIsStudentLogin] = useState(false);

  const [schoolDetails, setSchooDetails] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const onSuccess = (data) => {
      setLoading(false);
      toast.success("Login successfully!");
      const user = data.user;
      if (user.user_type?.toLowerCase()) {
        // case "teacher":
        window.location = "/dashboard";
        //   break;
        // case "admin":
        //    window.location="/dashboard";
        //   break;
        // case "student":
        //    window.location="/dashboard";
        //   break;
      }
    };

    const onError = ({ errors }) => {
      console.error("Login error:", errors);
      setLoading(false);
      if (errors && errors?.password) {
        toast.error(errors?.password);
      } else if (errors && errors?.username) {
        toast.error(errors?.username);
      } else if (errors && errors?.status) {
        toast.error(errors?.status);
      } else {
        toast.warning(errors ? Object.values(errors)[0] : "Failed to Login");
      }
    };

    dispatch(
      login(
        {
          username: form.email,
          password: form.password,
          school_id: form.school_id,
          history: navigate,
          type: isStudentLogin ? "students" : "users",
        },
        onSuccess,
        onError
      )
    );
  };

  useEffect(() => {
    setIsSchoolLoading(true);
    _get(
      `schools/get-details?query_type=select-by-short-name&short_name=${short_name}`,
      (res) => {
        setIsSchoolLoading(false);
        if (res.success && res.data && res.data.length > 0) {
          setSchooDetails(res.data[0]);
          setForm((p) => ({ ...p, school_id: res.data[0].school_id }));
        } else {
          console.log(res.message);
        }
      },
      (err) => {
        setIsSchoolLoading(false);
        console.error("Error fetching school details:", err);
      }
    );
  }, [short_name, isStudentLogin]);

  if (schoolDetails && schoolDetails?.cbt_center < 1) {
    return (
      <div className="login-wrapper">
        <Container fluid className="h-100">
          <Row className="justify-content-center align-items-center min-vh-100">
            <Col xs="11" sm="10" md="8" lg="6" xl="5" xxl="4">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="elite-card shadow-lg border-0">
                  <CardBody className="p-4 p-md-5 text-center">
                    <div className="logo-container mb-4">
                      <img
                        src={
                          schoolDetails?.badge_url ||
                          require("../../assets/startupIcon.png")
                        }
                        className="school-logo"
                        alt="School Logo"
                      />
                    </div>
                    <div className="brand-section mb-4">
                      <h2 className="text-white">Elite CBT</h2>
                      <div className="elite-subtitle">
                        Computer Based Testing Platform
                      </div>
                    </div>
                    <div className="alert alert-warning border-0 rounded-3">
                      <h5 className="text-warning mb-2">
                        <FaSignInAlt className="me-2" />
                        Access Restricted
                      </h5>
                      <p className="mb-0">
                        Your school doesn't subscribe to the CBT module. Please
                        contact your administrator.
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="login-wrapper">
      <Container fluid className="h-100">
        <Row className="justify-content-center align-items-center">
          <Col xs="11" sm="10" md="8" lg="6" xl="5" xxl="4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="elite-card shadow-lg  mt-3 border-0">
                <CardBody className="p-4 p-md-5">
                  {/* Logo Section */}
                  <div className="logo-container text-center mb-4">
                    <motion.img
                      src={
                        schoolDetails?.badge_url ||
                        startupIcon
                      }
                      className="school-logo"
                      alt="School Logo"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>

                  {/* Brand Section */}
                  <div className=" text-center mb-4">
                    <h2 className="text-white">Elite CBT</h2>
                    <div className="elite-subtitle">
                      Computer Based Testing Platform
                    </div>
                  </div>

                  {/* Login Type Toggle */}
                  <div className="login-type-toggle mb-4">
                    <Row className="g-2">
                      <Col xs="6">
                        <Button
                          color={
                            !isStudentLogin ? "primary" : "outline-primary"
                          }
                          block
                          className="login-type-btn"
                          onClick={() => {
                            setIsStudentLogin(false);
                            setForm(_form);
                            setError("");
                          }}
                        >
                          <FaChalkboardTeacher className="me-2" />
                          <span className="d-none d-sm-inline">Staff</span>
                        </Button>
                      </Col>
                      <Col xs="6">
                        <Button
                          color={isStudentLogin ? "primary" : "outline-primary"}
                          block
                          className="login-type-btn"
                          onClick={() => {
                            setIsStudentLogin(true);
                            setForm(_form);
                            setError("");
                          }}
                        >
                          <FaGraduationCap className="me-2" />
                          <span className="d-none d-sm-inline">Student</span>
                        </Button>
                      </Col>
                    </Row>
                  </div>

                  {/* Login Form */}
                  <Form onSubmit={handleSubmit}>
                    {(!short_name.length || short_name === "localhost") && (
                      <FormGroup className="mb-3">
                        <div className="input-group-modern">
                          <div className="input-icon">
                            <FaUser />
                          </div>
                          <Input
                            name="school_id"
                            type="text"
                            placeholder="Enter School Short Name"
                            value={form.school_id}
                            onChange={handleChange}
                            required
                            className="form-control-modern"
                          />
                        </div>
                      </FormGroup>
                    )}

                    <FormGroup className="mb-3">
                      <div className="input-group-modern">
                        <div className="input-icon">
                          <FaUser />
                        </div>
                        <Input
                          type={isStudentLogin ? "text" : "email"}
                          name="email"
                          placeholder={
                            isStudentLogin
                              ? "Enter your admission number"
                              : "Enter your email address"
                          }
                          value={form.email}
                          onChange={handleChange}
                          required
                          className="form-control-modern"
                        />
                      </div>
                    </FormGroup>

                    <FormGroup className="mb-4">
                      <div className="input-group-modern">
                        <div className="input-icon">
                          <FaLock />
                        </div>
                        <Input
                          type="password"
                          name="password"
                          placeholder="Enter your password"
                          value={form.password}
                          onChange={handleChange}
                          required
                          className="form-control-modern"
                        />
                      </div>
                    </FormGroup>

                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <FormGroup check className="mb-0">
                        <Label check className="remember-me-label">
                          <Input type="checkbox" className="me-2" />
                          <span className="d-none d-sm-inline">
                            Remember me
                          </span>
                          <span className="d-sm-none">Remember</span>
                        </Label>
                      </FormGroup>
                      <a href="#" className="forgot-password-link">
                        Forgot Password?
                      </a>
                    </div>

                    {error && (
                      <div className="alert alert-danger border-0 rounded-3 mb-3">
                        <small>{error}</small>
                      </div>
                    )}

                    <Button
                      color="primary"
                      block
                      size="lg"
                      className="login-submit-btn"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner
                            size="sm"
                            className="me-2"
                            style={{ width: "1rem", height: "1rem" }}
                          />
                          Signing In...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </Form>
                </CardBody>
                <CardFooter className="text-center elite-footer">
                  <p className="mb-0 ">Powered by Elite Scholar</p>
                </CardFooter>
              </Card>
            </motion.div>
          </Col>
        </Row>
        <Row className="justify-content-center mt-4">
          <Col xs="11" sm="10" md="8" lg="6" xl="5" xxl="4" className="text-center">
            <div className="partner-brands">
              <a href="#" className="partner-link">
                <img
                  src={cbtbase}
                  alt="CBT Base"
                  className="partner-logo"
                />
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}