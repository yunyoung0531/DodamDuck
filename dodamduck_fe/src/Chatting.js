import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from './AuthContext';


function Chatting() {
    const { user } = useAuth();

    if (!user) {
        return <div>로딩 중...</div>;
    }

    return (
        <>
        <div className="chat-container">
            <div style={{margin: '20px', display: 'flex', flexDirection: 'column'}}>
                    
                
                <div style={{display: 'flex', justifyContent: 'center'}}>
                <img src={user.profile_url || "https://www.lab2050.org/common/img/default_profile.png"}  width={'80px'} height={'80px'} style={{borderRadius: '50%'}}/>
                    <h4 style={{marginRight: '15px', marginTop: '20px', marginLeft: '18px'}}>{user.userName} 님</h4>
                    <h7 style={{marginTop: '24px'}} className="chat-user-level">level.{user.level}</h7>
                </div>

                <h6 style={{marginTop: '30px', color: '#303030'}}>
                    채팅 중인 이웃
                </h6>
                <div className="chat-user-line">
                    <div style={{display: 'flex', marginTop: '7px', marginBottom: '7px'}}>
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqIArEc23xr8KUpAm1yS6vPXjtg__1D5RvSQ&usqp=CAU" width={'72px'} height={'72px'} style={{borderRadius: '50%'}}/>
                        <div style={{ flexDirection: 'column'}}>
                            <h6 style={{marginRight: '15px', marginTop: '20px', marginLeft: '10px', cursor: 'pointer' }}>포로리파파</h6>
                            <h6 className='myshop-level' style={{marginTop: '0px', marginLeft: '10px' ,color: '#464646', fontSize: 'small'}}>최근 대화 내용입니다람쥐🐿️</h6>
                        </div>
                    </div>
                </div>
                <div className="chat-user-line">
                    <div style={{display: 'flex', marginTop: '7px', marginBottom: '7px'}}>
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqIArEc23xr8KUpAm1yS6vPXjtg__1D5RvSQ&usqp=CAU" width={'72px'} height={'72px'} style={{borderRadius: '50%'}}/>
                        <div style={{ flexDirection: 'column'}}>
                            <h6 style={{marginRight: '15px', marginTop: '20px', marginLeft: '10px', cursor: 'pointer' }}>포로리파파</h6>
                            <h6 className='myshop-level' style={{marginTop: '0px', marginLeft: '10px' ,color: '#464646', fontSize: 'small'}}>최근 대화 내용</h6>
                        </div>
                    </div>
                </div>
                <div className="chat-user-line">
                    <div style={{display: 'flex', marginTop: '7px', marginBottom: '7px'}}>
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqIArEc23xr8KUpAm1yS6vPXjtg__1D5RvSQ&usqp=CAU" width={'72px'} height={'72px'} style={{borderRadius: '50%'}}/>
                        <div style={{ flexDirection: 'column'}}>
                            <h6 style={{marginRight: '15px', marginTop: '20px', marginLeft: '10px', cursor: 'pointer' }}>포로리파파</h6>
                            <h6 className='myshop-level' style={{marginTop: '0px', marginLeft: '10px' ,color: '#464646', fontSize: 'small'}}>최근 대화 내용</h6>
                        </div>
                    </div>
                </div>
            </div>

            <div className="chat-line" >

            </div>
                <div style={{flexDirection: 'column', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <FontAwesomeIcon icon={faComments}  style={{color: "#d6d6d6", fontSize: "95px", marginLeft: '275px' }} />
                    <p className="recent-chat-comment" style={{display: 'flex', justifyContent: 'center', textAlign: 'center', alignItems: 'center', marginLeft: '270px', marginTop: '15px'}}>채팅할 상대를 선택해주세요</p>
                </div>
        </div>
        </>
    )
}

export default Chatting;