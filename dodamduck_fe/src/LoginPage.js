import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button } from 'react-bootstrap';
import 도담덕캐릭터 from './img/도담덕캐릭텨(누끼).png'

function LoginPage() {
    return(
        <>
            <div className='login-for login-container'>
                <Form >
                    <Form.Group className="mb-4" controlId="formGroupEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control type="email" placeholder="이메일을 입력하세요。" style={{width: '350px'}} />
                    </Form.Group>
                    <Form.Group className="mb-4" controlId="formGroupPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder="비밀번호를 입력하세요。" />
                    </Form.Group>
                    <div className='login-page-already'>
                    <p style={{ fontSize: '13px', color: '#787878', marginRight: '135px'}}>이미 계정이 있으신가요?</p>
                    <Button variant="outline-dark" className='login-btn'
                    // style={{ marginTop: '220px', marginLeft: '30px'}}
                    onClick={()=>{}}
                    >로그인</Button>
                    </div>
                </Form>
                
            </div>
            <img 
                    src={도담덕캐릭터}
                    width="150"                    
                    height="150"                  
                    className="d-inline-block align-top login-dodamduck1-img"/>
            <img 
                    src={도담덕캐릭터}
                    width="150"                    
                    height="150"                  
                    className="d-inline-block align-top login-dodamduck2-img"/>
        </>
    )
}

export default LoginPage;