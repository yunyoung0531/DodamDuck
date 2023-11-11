import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Container, Form, Nav, Navbar, NavDropdown, Offcanvas } from 'react-bootstrap';
import 도담덕로고 from './img/도담덕로고.png'
import './assets/fonts/fonts.css';
import Main1 from './Main1';
import Main2 from './Main2';
import Main3 from './Main3';
import Main4 from './Main4';
import LoginPage from './LoginPage';
import { Link, useNavigate, useParams} from 'react-router-dom';
import React from 'react';
import SignupPage from './SignupPage';
import Library from './Library';
import SharingBoard from './SharingBoard';
import SharingPost from './SharingPost';
import { PostProvider } from './PostContext';
import Board from './Board';
import BoardPost from './BoardPost';
import SharingDetail from './SharingDetail';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MyShop from './MyShop';
import Chatting from './Chatting';
import ChattingDetail from './ChattingDetail';
import BoardDetail from './BoardDetail';
import sharingDetail from './SharingDetail';

//const SharingDetail = lazy(() => import('./SharingDetail.js'));


function App() { 

  let navigate = useNavigate();
  return (
    <>
    <PostProvider>
    <div className='App'>
      {['sm'].map((expand) => (
      <Navbar fixed="top" className="nav-color mb-3 " key={expand} expand={expand} >
        <Container>
            <Navbar.Brand onClick={()=>{ navigate('/') }}>
                <img 
                src={도담덕로고}
                width="40"                    
                height="40"                  
                className="d-inline-block align-top main-logo-img"/>
                <span className='main-logo-dodamduck'>도담덕</span>
            </Navbar.Brand>
          <Nav className="me-auto link-spacing">
            <Nav.Link className='link-spacing' onClick={()=>{ navigate('/sharingBoard') }}>장난감 교환</Nav.Link>
            <Nav.Link className='link-spacing' onClick={()=>{ navigate('/library') }}>장난감 도서관</Nav.Link>
            <Nav.Link className='link-spacing' onClick={()=>{ navigate('/board')}}>게시판</Nav.Link>
            <Nav.Link className='link-spacing' onClick={()=>{ navigate('/myShop')}}>내 상점</Nav.Link>
            <Nav.Link className='link-spacing' onClick={()=>{ navigate('/chatting') }}>채팅</Nav.Link>
          </Nav>
          
          <Button variant="outline-dark" className='login-btn'
            onClick={()=>{ navigate('/login') }}
          >로그인</Button>
        </Container>
      </Navbar>
      ))}

      <Routes>

        <Route path='/' element={<>
        <div className='app-main'>
            <Main1 className="main-section"/>
            <Main2 className="main-section"/>
            <Main3 className="main-section"/>
            <Main4 className="main-section"/>
        </div>
        </>}/>
      
          <Route path='/login' element={<>
          <LoginPage/>
          </>}/>
          <Route path='/signup' element={<>
          <SignupPage/>
          </>}/>
          <Route path='/library' element={<>
          <Library/>
          </>}/>
          <Route path='/sharingBoard' element={<>
          <SharingBoard/>
          </>}/>
          <Route path='/sharingPost' element={<>
          <SharingPost/>
          </>}/>
          <Route path='/Board' element={<>
          <Board/>
          </>}/>
          <Route path='/BoardPost' element={<>
          <BoardPost/>
          </>}/>
          <Route path='/myShop' element={<>
          <MyShop/>
          </>}/>
          <Route path='/chatting' element={<>
          <Chatting/>
          </>}/>
          <Route path='/chattingDetail' element={<>
          <ChattingDetail/>
          </>}/>
          <Route path='/boardDetail' element={<>
          <BoardDetail/>
          </>}/>
          <Route path='/sharingDetail' element={
          //<Suspense fallback={<div>로딩중</div>}>
            <SharingDetail/>
          //</Suspense>
          }/>

          <Route path='*' element={<div style={{ margin: '200px'}}>404</div>}/>
      </Routes>
      </div>
      </PostProvider>
    </>
  );
}

export default App;
