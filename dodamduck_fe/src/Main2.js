import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 도담덕캐릭터 from './img/도담덕캐릭텨(누끼).png'

function Main2() {
    return (
        <>
            <div className='main2-container app-main'>
                <img 
                    src={도담덕캐릭터}
                    width="250"                    
                    height="250"                  
                    className="d-inline-block align-top main-dodamduck-img"/>
                
                <div style={{ textAlign: 'center' }}> 
                    <div style={{ marginLeft: '-100px'}}><h1 style={{ fontSize: '55px' }}>하나의 장난감,</h1></div>
                    <div style={{ marginLeft: '200px'}}><h1 style={{ fontSize: '55px' }}>무수한 웃음</h1></div>
                    <div className='main1-text'> 
                    <div style={{ marginLeft: '155px' , margin: '10px'}}><h5>교환의 기쁨을 경험하세요.</h5></div>
                    </div>
                </div> 
                
            </div>
            

        </>
    )
}

export default Main2;