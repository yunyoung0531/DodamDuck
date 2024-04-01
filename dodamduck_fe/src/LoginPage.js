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
    const { user, login } = useAuth();

    const handleIdChange = (e) => setId(e.target.value);
    const handlePasswordChange = (e) => setPassword(e.target.value);

    useEffect(() => {
        if (user) {
            console.log('user는 ?:', user);
        }
    }, [user]);


    const handleLogin = async (e) => {
        e.preventDefault();
    
        //JWT토큰
        const existingToken = localStorage.getItem('token');
    
        if (existingToken !== null) {
            try {
                const headers = {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                };
        
                const response = await axios.post('http://sy2978.dothome.co.kr/Login.php', {}, {headers});

                if (response.status === 200 ) {
                    // 토큰이 유효하다면, 사용자 데이터를 상태에 설정하고 홈으로 리다이렉트합니다.
                    console.log('성공:', response.data);
                    await login(existingToken, response.data);
                    navigate('/');
                } else if (response.status === 401 || response.status === 400) {
                    localStorage.removeItem('token');
                    alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
                }
            } catch (error) {
                console.error('토큰 검증 중 오류 발생', error);
                alert('토큰 검증 중 오류가 발생했습니다.');
            }
        } 
        else {
            // 처음에 토큰이 없는 경우
            const formData = new FormData();
            formData.append('userID', id);
            formData.append('userPassword', password);
    
            try {
                const response = await axios.post('http://sy2978.dothome.co.kr/Login.php', formData);
    
                if (response.data.login_success) {
                    const jwtToken = response.data.token;
                    await login(jwtToken, response.data);
                    navigate('/');
                } else {
                    console.error('로그인 실패', response.data.message);
                    alert('로그인에 실패했습니다: ' + response.data.message);
                }
            } catch (error) {
                console.error('로그인 중 오류 발생', error);
                alert('로그인 중 오류가 발생했습니다.');
            }
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