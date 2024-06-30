import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Form, Button, Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router";
import axios from "axios";
import React, { useState, ChangeEvent, FormEvent } from "react";

const SignupPage: React.FC = () => {
  let navigate = useNavigate();

  const [id, setId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isIdAvailable, setIsIdAvailable] = useState<boolean>(true);

  const handleIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
    setIsIdAvailable(true);
  };
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) =>
    setPassword(e.target.value);
  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) =>
    setAddress(e.target.value);
  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) =>
    setIsChecked(e.target.checked);

  const checkIdAvailability = async () => {
    if (!id) {
      alert("아이디를 입력해주세요.");
      return;
    }
    try {
      const response = await axios.post(
        "http://sy2978.dothome.co.kr/UserValidate.php",
        { userID: id }
      );
      setIsIdAvailable(response.data.isAvailable);
      if (!response.data.isAvailable) {
        alert("이미 사용중인 아이디입니다. 다른 아이디를 입력해주세요.");
      }
    } catch (error) {
      console.error("아이디 중복 검사 중 오류 발생:", error);
      alert("아이디 중복 검사 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!id) {
      alert("아이디를 입력해주세요.");
      return;
    } else if (!password) {
      alert("비밀번호를 입력해주세요.");
      return;
    } else if (!address) {
      alert("주소를 입력해주세요.");
      return;
    } else if (password.length < 8) {
      alert("비밀번호는 8자 이상이어야 합니다。");
      return;
    } else if (!/[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(password)) {
      alert("특수문자 하나 이상을 포함해야 합니다.");
      return;
    }
    if (!isChecked) {
      alert("약관에 동의해주세요.");
      return;
    }
    const formData = new FormData();
    formData.append("userID", id);
    formData.append("userPassword", password);
    formData.append("location", address);

    try {
      const response = await axios.post(
        "http://sy2978.dothome.co.kr/Register.php",
        formData
      );

      if (
        response.data.success ||
        response.data.message === "Registration successful"
      ) {
        console.log("회원가입 성공:", response.data);
        alert("회원가입 성공하였습니다! 로그인페이지로 이동합니다.");
        navigate("/login");
      } else {
        console.error("회원가입 실패:", response.data.message);
        if (response.data.message === "User already exists") {
          alert("이미 사용중인 아이디입니다. 다른 아이디를 입력해주세요.");
        }
      }
    } catch (error) {
      console.error("회원가입 중 오류 발생:", error);
    }
  };

  return (
    <div className="login-form signup-container">
      <Form onSubmit={handleSubmit} style={{ marginLeft: "100px" }}>
        <Row className="mb-3">
          <Form.Group
            as={Col}
            controlId="formGridId"
            style={{ marginLeft: "-50px" }}
          >
            <Form.Label>아이디</Form.Label>
            <Form.Control
              type="text"
              placeholder="아이디를 입력하세요。"
              style={{ width: "350px" }}
              className="signup-placeholder"
              value={id}
              onChange={handleIdChange}
              onBlur={checkIdAvailability}
            />
          </Form.Group>

          <Form.Group
            as={Col}
            controlId="formGridPassword"
            style={{ marginLeft: "0px" }}
          >
            <Form.Label>비밀번호</Form.Label>
            <Form.Control
              type="password"
              placeholder="비밀번호를 입력하세요。"
              style={{ width: "350px" }}
              className="signup-placeholder"
              value={password}
              onChange={handlePasswordChange}
            />
          </Form.Group>
        </Row>

        <Form.Group
          className="mb-3"
          controlId="formGridAddress1"
          style={{ marginLeft: "-50px" }}
        >
          <Form.Label>주소</Form.Label>
          <Form.Control
            type="text"
            placeholder="광주광역시 동구 필문대로 309"
            style={{ width: "350px" }}
            className="signup-placeholder"
            value={address}
            onChange={handleAddressChange}
          />
        </Form.Group>

        <Form.Group
          className="mb-3 custom-checkbox"
          id="formGridCheckbox"
          style={{ marginLeft: "-50px" }}
        >
          <Form.Check
            type="checkbox"
            label="Check me out"
            className="custom-checkbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
          />
        </Form.Group>

        <div className="login-page-already" style={{ marginLeft: "-50px" }}>
          <p
            style={{
              fontSize: "13px",
              color: "#787878",
              marginRight: "500px",
              cursor: "pointer",
            }}
            onClick={() => {
              navigate("/login");
            }}
          >
            이미 계정이 있으신가요?
          </p>
          <Button variant="outline-dark" type="submit" className="login-btn">
            회원가입
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default SignupPage;
