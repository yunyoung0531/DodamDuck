import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Container, Form, Nav, Navbar, NavDropdown, Offcanvas } from 'react-bootstrap';
import 도담덕로고 from './img/도담덕로고.png'
import './assets/fonts/fonts.css';

function App() {
  return (
    <>
    <div className='App'>
      {['sm'].map((expand) => (
      <Navbar key={expand} expand={expand} className="bg-body-tertiary mb-3">
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
          
          
        </Container>
      </Navbar>
      
      ))}
      </div>
    </>
  );
}

export default App;

