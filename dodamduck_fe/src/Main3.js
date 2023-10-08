import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 도담덕캐릭터 from './img/도담덕캐릭텨(누끼).png'
import 안드로이드메인 from './img/안드로이드_메인.png'
import 안드로이드도서관 from './img/안드로이드_도서관.png'

function Main3() {
    // useEffect(() => {
    //     const handleScroll = () => {
    //         const targetElement = document.getElementById('animated-text');
    //         const scrollPosition = window.scrollY;
    
    //         // 스크롤 위치에 따라 'active' 클래스를 추가 또는 제거합니다
    //         if (scrollPosition >= 300) { // 조건을 원하는 대로 조정하세요
    //         targetElement.classList.add('active');
    //         } else {
    //         targetElement.classList.remove('active');
    //         }
    //     };
    
    //     window.addEventListener('scroll', handleScroll);
    
    //     return () => {
    //         window.removeEventListener('scroll', handleScroll);
    //     };
    //     }, []);
    return (
        <>
            <div className='main1-container app-main3'>
                <img 
                    src={도담덕캐릭터}
                    style={{marginLeft: '160px'}}
                    width="250"                    
                    height="250"                  
                    className="d-inline-block align-top main-dodamduck-img"/>
                
                <div style={{ textAlign: 'center' }} className='main3-txt'> 
                    <div style={{ marginLeft: '-110px'}}><h1 style={{ fontSize: '48px' }}>나누면 더 커지는 행복,</h1></div>
                    <div style={{ marginLeft: '20px'}}><h1 style={{ fontSize: '48px' }}>장난감 교환으로 시작하세요.</h1></div>
                </div> 
                
                <img 
                    src={안드로이드메인}
                    width="170"                    
                    height="340"                  
                    className="d-inline-block align-top main3-android-main"/>
                <img 
                    src={안드로이드도서관}
                    width="170"                    
                    height="340"                  
                    className="d-inline-block align-top main-android-library"/>
            </div>
            

        </>
    )
}

export default Main3;