import { Container, Card, Button, Form } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';


function ChattingDetail() {
    return (
        <>
        <div className="chat-container">
            <div style={{margin: '20px', display: 'flex', flexDirection: 'column'}}>
                    
                
                <div style={{display: 'flex', justifyContent: 'center'}}>
                <img src="https://i1.sndcdn.com/avatars-000773808259-oqqdgp-t240x240.jpg" width={'80px'} height={'80px'} style={{borderRadius: '50%'}}/>
                    <h4 style={{marginRight: '15px', marginTop: '20px', marginLeft: '10px'}}>보노보노맘</h4>
                    <h7 style={{marginTop: '20px'}} className="myshop-level">위치</h7>
                </div>

                <h6 style={{marginTop: '30px', color: '#303030'}}>
                    채팅 중인 이웃
                </h6>
                <div className="chat-user-line">
                    <div style={{display: 'flex', marginTop: '7px', marginBottom: '7px'}}>
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqIArEc23xr8KUpAm1yS6vPXjtg__1D5RvSQ&usqp=CAU" width={'72px'} height={'72px'} style={{borderRadius: '50%'}}/>
                        <div style={{ flexDirection: 'column'}}>
                            <h6 style={{marginRight: '15px', marginTop: '20px', marginLeft: '10px' }}>포로리파파</h6>
                            <h6 className='myshop-level' style={{marginTop: '0px', marginLeft: '10px' ,color: '#464646', fontSize: 'small'}}>최근 대화 내용입니다람쥐🐿️</h6>
                        </div>
                    </div>
                </div>
                <div className="chat-user-line">
                    <div style={{display: 'flex', marginTop: '7px', marginBottom: '7px'}}>
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqIArEc23xr8KUpAm1yS6vPXjtg__1D5RvSQ&usqp=CAU" width={'72px'} height={'72px'} style={{borderRadius: '50%'}}/>
                        <div style={{ flexDirection: 'column'}}>
                            <h6 style={{marginRight: '15px', marginTop: '20px', marginLeft: '10px' }}>포로리파파</h6>
                            <h6 className='myshop-level' style={{marginTop: '0px', marginLeft: '10px' ,color: '#464646', fontSize: 'small'}}>최근 대화 내용</h6>
                        </div>
                    </div>
                </div>
                <div className="chat-user-line">
                    <div style={{display: 'flex', marginTop: '7px', marginBottom: '7px'}}>
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqIArEc23xr8KUpAm1yS6vPXjtg__1D5RvSQ&usqp=CAU" width={'72px'} height={'72px'} style={{borderRadius: '50%'}}/>
                        <div style={{ flexDirection: 'column'}}>
                            <h6 style={{marginRight: '15px', marginTop: '20px', marginLeft: '10px' }}>포로리파파</h6>
                            <h6 className='myshop-level' style={{marginTop: '0px', marginLeft: '10px' ,color: '#464646', fontSize: 'small'}}>최근 대화 내용</h6>
                        </div>
                    </div>
                </div>
            </div>

            <div className="chat-line" >

            </div>
                {/* <div style={{flexDirection: 'column', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <FontAwesomeIcon icon={faComments}  style={{color: "#d6d6d6", fontSize: "95px", marginLeft: '275px' }} />
                    <p className="recent-chat-comment" style={{display: 'flex', justifyContent: 'center', textAlign: 'center', alignItems: 'center', marginLeft: '270px', marginTop: '15px'}}>채팅할 상대를 선택해주세요</p>
                </div> */}
            <div style={{margin: '20px', display: 'flex', flexDirection: 'column'}}>
            
                <div style={{display: 'flex', marginTop: '7px', marginBottom: '7px'}}>
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqIArEc23xr8KUpAm1yS6vPXjtg__1D5RvSQ&usqp=CAU" width={'72px'} height={'72px'} style={{borderRadius: '50%'}}/>
                    <h6 style={{marginRight: '15px', marginTop: '20px', marginLeft: '10px'}}>포로리파파</h6>
                    <h6 style={{marginTop: '20px', color: '#FFD600'}} className="myshop-level">level.4</h6>
                </div>

                <div className="chat2-user-line">
                    <div style={{display: 'flex', marginTop: '7px', marginBottom: '7px'}}>
                    <img src="https://wafuu.com/cdn/shop/products/sanrio-official-cinnamoroll-baby-care-set-512991-plush-toy-doll-185313.jpg?v=1695256528" width={'72px'} height={'72px'} style={{borderRadius: '5%'}}/>
                        <div style={{ flexDirection: 'column'}}>
                            <h6 style={{marginRight: '15px', marginTop: '20px', marginLeft: '10px', fontSize: 'small' }}>시나모롤 인형세트</h6>
                            <h6 className='myshop-level chat-radio' style={{marginTop: '0px', marginLeft: '10px' , fontSize: 'small'}}>교환</h6>
                        </div>
                    </div>
                </div>

                <div className="chat2-user-line">
                    <p className='chat-date' style={{marginTop: '15px'}}>2023년 11월 07일</p>
                    <div style={{display: 'flex', marginTop: '7px', marginBottom: '7px'}}>
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqIArEc23xr8KUpAm1yS6vPXjtg__1D5RvSQ&usqp=CAU" width={'47px'} height={'47px'} style={{borderRadius: '50%'}}/>
                        <div style={{ flexDirection: 'column'}}>
                            <h6 className='real-chat' style={{marginRight: '15px', marginTop: '24px', marginLeft: '10px', fontSize: 'small' }}>교환할 수 있을까용?</h6>
                        </div>
                    </div>
                    <div style={{display: 'flex', marginTop: '7px', marginBottom: '7px'}}>
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqIArEc23xr8KUpAm1yS6vPXjtg__1D5RvSQ&usqp=CAU" width={'47px'} height={'47px'} style={{borderRadius: '50%'}}/>
                        <div style={{ flexDirection: 'column'}}>
                            <h6 className='real-chat' style={{marginRight: '15px', marginTop: '24px', marginLeft: '10px', fontSize: 'small' }}>시간은 언제 되시나요?</h6>
                        </div>
                    </div>
                    <div style={{display: 'flex', marginTop: '9px', marginBottom: '9px'}}>
                        {/* <div style={{ flexDirection: 'column'}}> */}
                            <h6 className='real-chat-me' >네 됩니다.</h6>
                            {/* style={{marginRight: '15px', marginTop: '24px', marginLeft: '10px', fontSize: 'small' }} */}
                        {/* </div> */}
                    </div>
                    <div style={{display: 'flex', marginTop: '9px', marginBottom: '9px'}}>
                        {/* <div style={{ flexDirection: 'column'}}> */}
                            <h6 className='real-chat-me' >내일도 됩니다~</h6>
                            {/* style={{marginRight: '15px', marginTop: '24px', marginLeft: '10px', fontSize: 'small' }} */}
                        {/* </div> */}
                    </div>
                    
                    <div style={{ display: 'flex'}}>
                    <Form.Control type="text" placeholder="메시지를 입력해주세요." className="chat-ready"
                        style={{
                            // paddingBottom: '-100px !important'
                            // width: '37rem',
                            // height: "30px",
                            // display: "flex",
                            // justifyContent: "center",
                            // alignItems: "center",
                            // backgroundColor: "#f8f8f8",
                            // margin: "10px 10px 10px 10px" 
                        }}/> 
                        <FontAwesomeIcon icon={faPaperPlane} style={{color: "#dcdcdc", marginTop: '85px'}} />
                        
                    </div>
                </div>

                {/* <div style={{display: "flex", marginTop: '100px !important'}}> */}
                        {/* <Form.Control type="text" placeholder="메시지를 입력해주세요." className="chat-ready"
                        style={{
                            // width: '37rem',
                            // height: "30px",
                            // display: "flex",
                            // justifyContent: "center",
                            // alignItems: "center",
                            // backgroundColor: "#f8f8f8",
                            // margin: "10px 10px 10px 10px" 
                        }}/> */}
                    {/* </div> */}

            </div>
            
        </div>
        </>
    )
}

export default ChattingDetail;