import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 도담덕캐릭터 from './img/도담덕캐릭텨(누끼).png'

function Main3() {
    return (
        <>
            <div className='main1-container app-main'>
                <img 
                    src={도담덕캐릭터}
                    width="250"                    
                    height="250"                  
                    className="d-inline-block align-top main-dodamduck-img"/>
                
                <div style={{ textAlign: 'center' }}> 
                    <div style={{ marginLeft: '-120px'}}><h1 style={{ fontSize: '50px' }}>나누면 더 커지는 행복,</h1></div>
                    <div style={{ marginLeft: '20px'}}><h1 style={{ fontSize: '50px' }}>장난감 교환으로 시작하세요.</h1></div>
                </div> 
                
            </div>
            

        </>
    )
}

export default Main3;