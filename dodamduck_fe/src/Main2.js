import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 도담덕캐릭터 from './img/도담덕캐릭텨(누끼).png'
import 안드로이드홈 from './img/안드로이드_홈.png'
import 안드로이드메인 from './img/안드로이드_메인.png'

function Main2() {
    return (
        <>
            <div className='main2-container app-main3'>
                <img 
                    src={도담덕캐릭터}
                    style={{marginLeft: '270px'}}
                    width="250"                    
                    height="250"                  
                    className="d-inline-block align-top main-dodamduck-img"/>
                
                <div style={{ textAlign: 'center'}} className='main1-txt'> 
                    <div style={{ marginLeft: '20px'}}><h1 style={{ fontSize: '50px' }}>하나의 장난감,</h1></div>
                    <div style={{ marginLeft: '70px'}}><h1 style={{ fontSize: '50px' }}>무수한 웃음</h1></div>
                    <div className='main1-text'> 
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
    )
}

export default Main2;