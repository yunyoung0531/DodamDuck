import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 도담덕캐릭터 from './img/도담덕캐릭텨(누끼).png'

function Main1() {
    return (
        <>
            <div className='main-container'>
                <img 
                    src={도담덕캐릭터}
                    width="250"                    
                    height="250"                  
                    className="d-inline-block align-top main-dodamduck-img"/>
                
                <div style={{ textAlign: 'center' }}> 
                    <h1 style={{ fontSize: '55px' }}>어제의 장난감, 오늘의 행복</h1>
                    <div className='main1-text'> 
                    <div style={{ marginLeft: '-150px' }}><h5>여기에서 시작하는 작은 교환, </h5></div>
                    <div style={{ marginLeft: '155px' , margin: '10px'}}><h5>큰 행복으로 연결됩니다.</h5></div>
                    </div>
                </div> 
                
            </div>
            

        </>
    )
}

export default Main1;