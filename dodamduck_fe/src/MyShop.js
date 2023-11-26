import {Tab, Tabs} from 'react-bootstrap';
import { useAuth } from './AuthContext';
import React from 'react';

function MyShop() {
    const { user } = useAuth();
    console.log('myshop-지금 로그인된 사람은? ', user);
    // console.log('myshop-지금 로그인된 사람은? ', user.userName);
    // console.log('myshop-지금 로그인된 사람은? ', user.userID);
    // console.log('myshop-지금 로그인된 사람은? ', user.level);

    if (!user) {
        return <div>로딩 중...</div>;
    }
    return (
        <>
        <div className="myshop-container " style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{margin: '60px'}}>
                <img src={user.profile_url || "https://www.lab2050.org/common/img/default_profile.png"} width={'140px'} height={'140px'} style={{ borderRadius: '50%' }}/>
            </div>
            <div style={{display: 'flex', justifyContent: 'center'}}>
                <h4 style={{marginRight: '30px'}}>{user.userName}({user.userID}) 님</h4>
            
                <div style={{ display: 'flex', flexDirection: 'column', marginTop: '40px', marginLeft: '-218px' }} className='myshop-information'>
                    <p className="myshop-level">level.{user.level}</p>
                    <p className="myshop-level"> 인증 횟수: {user.verification_count}</p>
                    <p className="myshop-level"> 위치: {user.location}</p>
                </div>
            </div>
        </div>
        <div style={{ maxWidth: '1108px', margin: 'auto' }}>
            <Tabs
            defaultActiveKey="home"
            id="uncontrolled-tab-example"
            className="mb-3"
            >
            <Tab eventKey="home" title="상품">
                <div style={{display: 'flex'}}>
                    <div style={{margin: '20px' }}>
                        <img src='https://img1.tmon.kr/cdn3/deals/2019/06/20/2187486298/front_07afa_gxvub.jpg' width={'140px'} height={'140px'} style={{borderRadius: '5%'}}/>
                        <h6 style={{display: 'flex', textAlign:'center'}}>뽀로로 오뚜기</h6>
                    </div>
                    <div style={{margin: '20px'}}>
                        <img src='https://cdn.011st.com/11dims/resize/600x600/quality/75/11src/product/4957671460/B.jpg?751000000' width={'140px'} height={'140px'} style={{borderRadius: '5%'}}/>
                        <h6 style={{display: 'flex', textAlign:'center'}}>포로리 인형</h6>
                    </div>
                </div>
            </Tab>
            <Tab eventKey="profile" title="하트목록">
                내가 하트 누른거 나옴
            </Tab>
            </Tabs>
        </div>
        </>
    )
}

export default MyShop;