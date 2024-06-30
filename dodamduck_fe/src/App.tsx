import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Container, Nav, Navbar } from "react-bootstrap";
import 도담덕로고 from "./img/도담덕로고.png";
import "./assets/fonts/fonts.css";
import Main1 from "./Main1";
import Main2 from "./Main2";
import Main3 from "./Main3";
import Main4 from "./Main4";
import LoginPage from "./LoginPage";
import { useNavigate } from "react-router-dom";
import React, { useEffect } from "react";
import SignupPage from "./SignupPage";
import Library from "./Library";
import SharingBoard from "./SharingBoard";
import SharingPost from "./SharingPost";
import Board from "./Board";
import BoardPost from "./BoardPost";
import SharingDetail from "./SharingDetail";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MyShop from "./MyShop";
import Chatting from "./Chatting";
import ChattingDetail from "./ChattingDetail";
import BoardDetail from "./BoardDetail";
import { useAuth } from "./AuthContext";

const App: React.FC = () => {
  const { user, logout } = useAuth();
  let navigate = useNavigate();

  useEffect(() => {
    console.log("(App.js)userID는? ", sessionStorage.getItem("userID"));
    console.log("(App.js)userName는? ", sessionStorage.getItem("userName"));
    console.log("(App.js)level는? ", sessionStorage.getItem("level"));
    console.log(
      "(App.js)verification_count는 ? ",
      sessionStorage.getItem("verification_count")
    );
    console.log("(App.js)location는? ", sessionStorage.getItem("location"));
    console.log("(App.js)토큰은? ", localStorage.getItem("token"));
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      console.log("로그아웃 되었습니다.");
      navigate("/login");
    } catch (error) {
      console.error("로그아웃 중 문제가 발생했습니다.", error);
    }
  };

  return (
    <div className="App">
      {["sm"].map((expand) => (
        <Navbar
          fixed="top"
          className="nav-color mb-3 "
          key={expand}
          expand={expand}
        >
          <Container>
            <Navbar.Brand
              onClick={() => {
                navigate("/");
              }}
            >
              <img
                src={도담덕로고}
                width="40"
                height="40"
                className="d-inline-block align-top main-logo-img"
              />
              <span className="main-logo-dodamduck">도담덕</span>
            </Navbar.Brand>
            <Nav className="me-auto link-spacing">
              <Nav.Link
                className="link-spacing"
                onClick={() => {
                  navigate("/sharingBoard");
                }}
              >
                장난감 교환
              </Nav.Link>
              <Nav.Link
                className="link-spacing"
                onClick={() => {
                  navigate("/library");
                }}
              >
                장난감 도서관
              </Nav.Link>
              <Nav.Link
                className="link-spacing"
                onClick={() => {
                  navigate("/board");
                }}
              >
                게시판
              </Nav.Link>
              <Nav.Link
                className="link-spacing"
                onClick={() => {
                  navigate("/myShop");
                }}
              >
                내 상점
              </Nav.Link>
              <Nav.Link
                className="link-spacing"
                onClick={() => {
                  navigate("/chatting");
                }}
              >
                채팅
              </Nav.Link>
            </Nav>

            {user ? (
              <>
                <div className="navbar-username">
                  {user.userName}님 안녕하세요 :) 💛ㅤ
                </div>
                <Button
                  variant="outline-dark"
                  className="login-btn"
                  onClick={handleLogout}
                >
                  로그아웃
                </Button>
              </>
            ) : (
              <Button
                variant="outline-dark"
                className="login-btn"
                onClick={() => navigate("/login")}
              >
                로그인
              </Button>
            )}
          </Container>
        </Navbar>
      ))}

      <Routes>
        <Route
          path="/"
          element={
            <div className="app-main">
              <Main1 className="main-section" />
              <Main2 className="main-section" />
              <Main3 className="main-section" />
              <Main4 className="main-section" />
            </div>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/library" element={<Library />} />
        <Route path="/sharingBoard" element={<SharingBoard />} />
        <Route path="/sharingPost" element={<SharingPost />} />
        <Route path="/Board" element={<Board />} />
        <Route path="/BoardPost" element={<BoardPost />} />
        <Route path="/myShop" element={<MyShop />} />
        <Route path="/chatting" element={<Chatting />} />
        <Route
          path="/chattingDetail/:id/:partnerID/:partnerName/:myID"
          element={<ChattingDetail />}
        />
        <Route path="/boardDetail/:id" element={<BoardDetail />} />
        <Route path="/sharingDetail/:id" element={<SharingDetail />} />

        <Route
          path="*"
          element={
            <div style={{ margin: "200px" }}>페이지를 찾을 수 없습니다!</div>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
