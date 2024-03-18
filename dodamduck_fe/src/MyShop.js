import {Tab, Tabs} from 'react-bootstrap';
import { useAuth } from './AuthContext';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function MyShop() {
    const { user } = useAuth();
    console.log('myshop-지금 로그인된 사람은? ', user);

    const [products, setProducts] = useState([]);
    let navigate = useNavigate();

    useEffect(() => {
        if(user) {
            axios.get('http://sy2978.dothome.co.kr/Post.php')
                .then(response => {
                    const userProducts = response.data.filter(product => product.user_id === user.userID);
                    setProducts(userProducts);
                })
                .catch(error => {
                    console.error("상품 로딩 중 에러 발생", error);
                });
        }
    }, [user]);

    // if (!user) {
    //     return <div>로딩 중...</div>;
    // }


    const incrementViewCount = async (postId) => {
        try {
            const postData = new URLSearchParams();
            postData.append('post_id', postId);
            const response = await axios.post('http://sy2978.dothome.co.kr/upload_post_view_up.php', postData);
            console.log("조회수 증가 응답", response.data);

        } catch (error) {
            console.error('조회수 증가 API 호출 실패', error);
        }
    }
    const handleCardClick = (postId) => {
        incrementViewCount(postId); 
        navigate(`/sharingDetail/${postId}`);
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
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {products.map(product => (
                <div key={product.id}style={{ margin: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '140px' }} >
                    <div style={{margin: '20px' }}>
                        <img src={`http://sy2978.dothome.co.kr/uploads/post_id${product.post_id}.jpg`} width={'140px'} height={'140px'} style={{borderRadius: '5%', display: 'flex', alignItems:'center', justifyContent: 'center', marginBottom: '6px', cursor: 'pointer'}}
                            onClick={() => handleCardClick(product.post_id)}
                        />
                        <h6 style={{display: 'flex', textAlign:'center', justifyContent: 'center'}} className='myshop-product'>{product.title}</h6>
                    </div>
                </div>
                ))}
                </div>
            </Tab>
            <Tab eventKey="profile" title="하트목록">
                (준비중😭)
            </Tab>
            </Tabs>
        </div>
        </>
    )
}

export default MyShop;