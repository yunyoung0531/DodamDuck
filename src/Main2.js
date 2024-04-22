import React, { useEffect } from 'react';
import './App.css';
import 도담덕캐릭터 from './img/도담덕캐릭텨(누끼).png';
import 안드로이드홈 from './img/안드로이드_홈.png';
import 안드로이드메인 from './img/안드로이드_메인.png';

function Main2() {
    useEffect(() => {
        const handleScroll = () => {
            const targetElement = document.getElementById('animated-text');
            const scrollPosition = window.scrollY;
            // 스크롤 위치에 따라 'active' 클래스를 추가 또는 제거
            if (scrollPosition >= 300) { 
                targetElement.classList.add('active');
            } else {
                targetElement.classList.remove('active');
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
    <>
        <div className='main2-container app-main3 main-section'>
        <img 
            src={도담덕캐릭터}
            style={{marginLeft: '270px'}}
            width="250"                    
            height="250"                  
            className="d-inline-block align-top main-dodamduck-img"/>
        
        <div style={{ textAlign: 'center'}} className='main1-txt'> 
            <div id="animated-text" className="slide-in active " style={{ marginLeft: '20px'}}>
            <h1 style={{ fontSize: '50px' }}>하나의 장난감,</h1>
            <h1 style={{ fontSize: '50px' }}>무수한 웃음</h1>
            </div>
            <div className='main1-text slide-in active'> 
            <div style={{ marginLeft: '155px' , margin: '10px'}}><h5>교환의 기쁨을 경험하세요.</h5></div>
            </div>
        </div> 

        <img 
            src={안드로이드메인}
            width="170"                    
            height="340"                  
            className="d-inline-block align-top main2-android-main"/>

        <img 
            src={안드로이드홈}
            width="170"                    
            height="340"                  
            className="d-inline-block align-top main-android-home"/>
        </div>
    </>
    );
}

export default Main2;
