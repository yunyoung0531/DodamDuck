import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button, Col, Row } from 'react-bootstrap';
import 도담덕캐릭터 from './img/도담덕캐릭텨(누끼).png'
import { useNavigate } from 'react-router';

function SignupPage() {
    let navigate = useNavigate();
    return(
        <>
            <div className='login-form signup-container'>
            <Form style={{marginLeft: '100px'}}>
                <Row className="mb-3">
                    <Form.Group as={Col} controlId="formGridEmail" style={{marginLeft: '-50px'}}>
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" placeholder="이메일을 입력하세요。" style={{width: '350px'}} />
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridPassword" style={{marginLeft: '0px'}}>
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="비밀번호를 입력하세요。" style={{width: '350px'}}/>
                    </Form.Group>
                </Row>

                <Form.Group className="mb-3" controlId="formGridAddress1" style={{marginLeft: '-50px'}}>
                    <Form.Label>Address</Form.Label>
                    <Form.Control placeholder="1234 Main St" style={{width: '350px'}} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formGridAddress2" style={{marginLeft: '-50px'}}>
                    <Form.Label>Address 2</Form.Label>
                    <Form.Control placeholder="Apartment, studio, or floor" style={{width: '350px'}}/>
                </Form.Group>

                <Row className="mb-3" >
                    <Form.Group as={Col} controlId="formGridCity" style={{marginLeft: '-50px'}}>
                    <Form.Label>City</Form.Label>
                    <Form.Control style={{width: '350px'}} />
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridState" style={{marginLeft: '0px'}}>
                    <Form.Label>State</Form.Label>
                    <Form.Select defaultValue="Choose..." style={{width: '350px'}}>
                        <option>Choose...</option>
                        <option>...</option>
                    </Form.Select>
                    </Form.Group>

                    {/* <Form.Group as={Col} controlId="formGridZip">
                    <Form.Label>Zip</Form.Label>
                    <Form.Control />
                    </Form.Group> */}
                </Row>

                <Form.Group className="mb-3 custom-checkbox" id="formGridCheckbox" style={{marginLeft: '-50px'}}>
                    <Form.Check type="checkbox" label="Check me out" className="custom-checkbox" />
                </Form.Group>

                <div className='login-page-already' style={{marginLeft: '-50px'}}>
                <p style={{ fontSize: '13px', color: '#787878', marginRight: '500px', cursor: 'pointer'}}
                    onClick={()=>{ navigate('/login') }}
                >이미 계정이 있으신가요?</p>
                    <Button variant="outline-dark" className='login-btn'
                    >회원가입</Button>
                    </div>
                </Form>
            </div>


            {/* <img 
                    src={도담덕캐릭터}
                    width="150"                    
                    height="150"                  
                    className="d-inline-block align-top login-dodamduck1-img"/>
            <img 
                    src={도담덕캐릭터}
                    width="150"                    
                    height="150"                  
                    className="d-inline-block align-top login-dodamduck2-img"/> */}
        </>
    )
}

export default SignupPage;