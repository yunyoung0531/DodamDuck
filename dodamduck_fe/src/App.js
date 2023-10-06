import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Container, Form, Nav, Navbar, NavDropdown, Offcanvas } from 'react-bootstrap';
import 도담덕로고 from './img/도담덕로고.png'
import './assets/fonts/fonts.css';
import Main1 from './Main1';
import Main2 from './Main2';
import Main3 from './Main3';

function App() {
  return (
    <>
    <div className='App app-main'>
      {['sm'].map((expand) => (
      <Navbar fixed="top" className="bg-body-tertiary mb-3 " key={expand} expand={expand} >
        <Container>
            <Navbar.Brand href="#">
                <img 
                src={도담덕로고}
                width="40"                    
                height="40"                  
                className="d-inline-block align-top main-logo-img"/>
                <span className='main-logo-dodamduck'>도담덕</span>
            </Navbar.Brand>
          <Nav className="me-auto link-spacing">
            <Nav.Link href="#home" className='link-spacing'>장난감 교환</Nav.Link>
            <Nav.Link href="#features " className='link-spacing'>장난감 도서관</Nav.Link>
            <Nav.Link href="#pricing " className='link-spacing'>게시판</Nav.Link>
            <Nav.Link href="#pricing " className='link-spacing'>내 상점</Nav.Link>
            <Nav.Link href="#pricing " className='link-spacing'>채팅</Nav.Link>
          </Nav>
          
          <Button variant="outline-dark" className='login-btn'>로그인</Button>
        </Container>
      </Navbar>
      ))}

      <Main1/>
      <Main2/>
      <Main3/>
      </div>
    </>
  );
}

export default App;

