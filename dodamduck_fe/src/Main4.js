import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 안드로이드손 from './img/안드로이드_손.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGooglePlay } from '@fortawesome/free-brands-svg-icons';
import 도담덕캐릭터 from './img/도담덕캐릭텨(누끼).png'

function Main4() {
    return (
        <>
            <div className='main1-container app-main4'>
                <div className='main4-large-container'>
                    <div>
                        <p className='main4-txt'>우리나라 최초 장난감 교환 플랫폼</p>
                    </div>
                    <div>
                        <h1 className='main4-dodamduck-txt'>도담덕</h1>
                    </div>

                    <img 
                    src={안드로이드손}
                    width="250"                    
                    height="250"                  
                    className="d-inline-block align-top main4-hand-img"/>

                    <div className='main4-google-container'>
                        <p className='google-play'>
                        <FontAwesomeIcon icon={faGooglePlay} style={{color: "#000000", marginRight: "4px"}} />
                            Google Play
                        </p>
                    </div>

                    <img 
                    src={도담덕캐릭터}
                    width="150"                    
                    height="150"                  
                    className="d-inline-block align-top main4-dodamduck-img"/>
                </div>
            </div>
            

        </>
    )
}

export default Main4;