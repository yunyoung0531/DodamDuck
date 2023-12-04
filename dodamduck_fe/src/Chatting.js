import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from './AuthContext';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useChat } from './ChatContext';

function Chatting() {
    const { user } = useAuth();
    const [chatList, setChatList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    // const { chatList, fetchChatList } = useChat();


    useEffect(() => {
        if (!user) {
            console.log("User is not defined, skipping API call.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        axios.get(`http://sy2978.dothome.co.kr/get_chat_list.php?user_id=${user.userID}`)
            .then(response => {
                console.log(response.data);
                if (response.data && Array.isArray(response.data.chat_list)) {
                    setChatList(response.data.chat_list);
                } else {
                    console.log('No chat list available');
                }
            })
            .catch(error => {
                console.error('채팅 목록 요청 실패:', error);
                setError(error);
            })
            .finally(() => setIsLoading(false));
    }, [user]);




    useEffect(() => {
        console.log('chatList가 업데이트 되었습니다: ', chatList);
    }, [chatList]);



    // useEffect(() => {
    //     if (user) {
    //         setIsLoading(true);
    //         fetchChatList(user.userID)
    //             .catch((error) => {
    //                 setError(error);
    //             })
    //             .finally(() => {
    //                 setIsLoading(false);
    //             });
    //     }
    // }, [user, fetchChatList]);

    // if (!user) {
    //     return <div>Loading...</div>;
    // }

    // if (isLoading) {
    //     return <div>Loading chat list...</div>;
    // }

    // if (error) {
    //     return <div>Error fetching chat list: {error.message}</div>;
    // }

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
                {chatList.map((chat, index) => (
                <div className="chat-user-line" key={chat.chat_id || index}>
                    <div style={{ display: 'flex', marginTop: '7px', marginBottom: '7px' }}>
                        <img src={`http://sy2978.dothome.co.kr/userProfile/user_id_${chat.user1_id === user.userID ? chat.user2_id : chat.user1_id}.jpg`} width={'72px'} height={'72px'} style={{ borderRadius: '50%' }} />
                        <div style={{ flexDirection: 'column' }}>
                            <h6 style={{ marginRight: '15px', marginTop: '20px', marginLeft: '10px', cursor: 'pointer' }}>
                                {chat.user1_id === user.userID ? chat.user2_name : chat.user1_name}     
                            </h6>
                            <h6 className='myshop-level' style={{ marginTop: '0px', marginLeft: '10px', color: '#464646', fontSize: 'small' }}>
                                {chat.last_message}
                            </h6>
                        </div>
                    </div>
                </div>
            ))}

            </div>

            <div className="chat-line" >

            </div>
                <div style={{flexDirection: 'column', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <FontAwesomeIcon icon={faComments}  style={{color: "#d6d6d6", fontSize: "95px", marginLeft: '275px' }} />
                    <p className="recent-chat-comment" style={{display: 'flex', justifyContent: 'center', textAlign: 'center', alignItems: 'center', marginLeft: '270px', marginTop: '15px'}}>채팅할 상대를 선택해주세요</p>
                </div>
        </div>
        </>
    );
}

export default Chatting;