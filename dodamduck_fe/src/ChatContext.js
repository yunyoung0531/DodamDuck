import React, { createContext, useState, useContext } from 'react';
import axios from 'axios'; // axios를 사용하여 API 호출

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const [chatList, setChatList] = useState([]);

    // 채팅 목록을 가져오는 함수
    const fetchChatList = async (userId) => {
        try {
        const response = await axios.get(`http://sy2978.dothome.co.kr/get_chat_list.php?user_id=${userId}`);
        // console.log(response.data);
        if (response.data.error === false && response.data.chatList && Array.isArray(response.data.chatList)) {
            console.log('됨')
            setChatList(response.data.chatList);
        } else {
            // console.log('No chat list available');///
            setChatList([]); // 에러가 발생하거나 chatList가 없는 경우 빈 배열로 설정
        }
        } catch (error) {
        console.error('채팅 목록 가져오기 실패:', error);
        setChatList([]); // 에러가 발생한 경우 빈 배열로 설정
        }
    };  

    // 채팅방을 생성하는 함수
    const createChatRoom = async (postId, userId) => {
        try {
        const formData = new FormData();
        formData.append('post_id', postId);
        formData.append('user_id', userId);
        
        const response = await axios.post('http://sy2978.dothome.co.kr/create_chat_room.php', formData);
        
        if (response.data.error === false) {
            // 채팅방 생성 후 채팅 목록을 다시 가져옵니다.

            console.log('채팅방이 성공적으로 생성되었습니다.', response.data);
            await fetchChatList(userId);
        } else {
            console.error('채팅방 생성 실패:', response.data.message);
        }
        } catch (error) {
        console.error('채팅방 생성 실패:', error);
        }
    };

    return (
        <ChatContext.Provider value={{ chatList, setChatList, fetchChatList, createChatRoom }}>
        {children}
        </ChatContext.Provider>
    );
};  
