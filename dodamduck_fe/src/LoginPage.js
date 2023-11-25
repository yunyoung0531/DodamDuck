import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button } from 'react-bootstrap';
import 도담덕캐릭터 from './img/도담덕캐릭텨(누끼).png'
import { useNavigate } from 'react-router';
import React, { useState } from 'react';
import axios from 'axios';
import { useEffect } from 'react';
import { useAuth } from './AuthContext';

function LoginPage() {
    let navigate = useNavigate();

    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const auth = useAuth();
    const { user, login } = useAuth();

    const handleIdChange = (e) => setId(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);

    useEffect(() => {
        if (user) {
            console.log('user는 ?:', user);
            // 로그인 상태에 따른 추가 작업을 여기에 수행
        }
    }, [user]);

    const handleLogin = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('userID', id);
        formData.append('userPassword', password);
        // formData.append('location', address);

        try {
            // const response = await axios.post('http://sy2978.dothome.co.kr/Login.php', {
            //     id: id,
            //     password: password
            // });
            const response = await axios.post('http://sy2978.dothome.co.kr/Login.php', formData);

            if (response.data.login_success) {
                await login(response.data.userID);
                console.log('로그인 성공', response.data);
                console.log('유저는??', user);
                navigate('/');
            } else {
                console.error('로그인 실패', response.data.message);
                alert('로그인에 실패했습니다: ' + response.data.message);
            }
        } catch (error) {
            console.error('로그인 중 오류 발생', error);
            alert('로그인 중 오류가 발생했습니다.');
        }
    };
    return(
        <>
            <div className='login-form login-container'>
                <Form onSubmit={handleLogin}>
                    <Form.Group className="mb-4" controlId="formGroupId">
                        <Form.Label>아이디</Form.Label>
                        <Form.Control type="id" placeholder="아이디를 입력하세요。" style={{width: '350px'}} className='signup-placeholder' 
                        value={id}
                        onChange={handleIdChange}
                        />
                    </Form.Group>
                    <Form.Group className="mb-4" controlId="formGroupPassword">
                        <Form.Label>비밀번호</Form.Label>
                        <Form.Control type="password" placeholder="비밀번호를 입력하세요。" className='signup-placeholder' 
                        value={password}
                        onChange={handlePasswordChange}/>
                    </Form.Group>
                    <div className='login-page-already'>
                    <p onClick={()=>{ navigate('/signup')}}style={{ fontSize: '13px', color: '#787878', marginRight: '135px', cursor: 'pointer'}}>계정이 아직 없으신가요?</p>
                    <Button variant="outline-dark" type="submit" className='login-btn'
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