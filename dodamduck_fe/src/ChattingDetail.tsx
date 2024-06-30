import { Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import React, {
  useState,
  useEffect,
  useRef,
  FormEvent,
  ChangeEvent,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { useNavigate, useParams } from "react-router-dom";

interface Message {
  id: string;
  senderID: string;
  receiverID: string;
  message: string;
  timestamp: string;
}

interface Chat {
  chat_id: string;
  user1_id: string;
  user2_id: string;
  user1_name: string;
  user2_name: string;
  last_message: string;
}

const ChattingDetail: React.FC = () => {
  const navigate = useNavigate();
  const [chatList, setChatList] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const { id, partnerID, partnerName, myID } = useParams<{
    id: string;
    partnerID: string;
    partnerName: string;
    myID: string;
  }>();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState(""); // 메시지 보내기 API 연동용

  const mostRecentMessage = messages[messages.length - 1];

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const previousMessagesRef = useRef<Message[]>([]);

  useEffect(() => {
    if (messages.length > previousMessagesRef.current.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    previousMessagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    // 채팅 리스트 (채팅하는 사람들) 보여줌
    const fetchChatList = async () => {
      const existingToken = localStorage.getItem("token");
      if (existingToken && user) {
        try {
          const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${existingToken}`,
          };
          const response = await axios.get(
            `http://sy2978.dothome.co.kr/get_chat_list.php?user_id=${user.userID}`,
            { headers }
          );
          console.log("response.data입니다, ", response.data);
          if (
            response.status === 200 &&
            response.data &&
            Array.isArray(response.data.chat_list)
          ) {
            setChatList(response.data.chat_list);
          } else {
            console.log("No chat list available");
          }
        } catch (error) {
          console.error("채팅 목록 요청 실패:", error);
        }
      }
    };
    fetchChatList();
  }, [user, navigate]);

  useEffect(() => {
    if (!user) {
      console.log("User is not defined, skipping API call.");
      return;
    }

    // 1:1 채팅 내역 가져오기
    const fetchMessages = async () => {
      console.log("Fetching messages...");
      const existingToken = localStorage.getItem("token");
      if (existingToken) {
        try {
          const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${existingToken}`,
          };
          const response = await axios.get(
            `http://sy2978.dothome.co.kr/getMessage.php?user1=${user.userID}&user2=${partnerID}`,
            { headers }
          );
          if (response.status === 200 && response.data) {
            setMessages(response.data);
          } else {
            console.log("No 채팅내역");
          }
        } catch (error) {
          console.error("채팅 목록 요청 실패:", error);
        }
      }
    };
    const intervalId = setInterval(() => {
      fetchMessages();
    }, 1000); // 1초마다 메시지 불러옴

    return () => clearInterval(intervalId); // 컴포넌트가 언마운트될 때 인터벌을 제거
  }, [user, partnerID]);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    console.log("myID: ", myID);
    if (!newMessage.trim() || !user?.userID) {
      console.error("메시지가 비어있거나 사용자 정보가 불충분합니다.");
      return;
    }

    const formData = new URLSearchParams();
    formData.append("senderID", myID!);
    formData.append("receiverID", partnerID!);
    formData.append("message", newMessage);

    const existingToken = localStorage.getItem("token");
    if (existingToken) {
      try {
        const response = await axios.post(
          "http://sy2978.dothome.co.kr/sendMessage.php",
          formData,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Bearer ${existingToken}`,
            },
          }
        );
        console.log("메시지보내기response.data", response.data);
        if (response.status === 200) {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: String(new Date().getTime()), // ID 생성 방식 필요
              senderID: myID!,
              receiverID: partnerID!,
              message: newMessage,
              timestamp: new Date().toISOString(),
            },
          ]);
          setNewMessage("");
        }
      } catch (error) {
        console.error("메시지 전송 실패:", error);
      }
    }
  };

  if (!user) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="chat-container">
      <div style={{ margin: "20px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img
            src={
              user.profile_url ||
              "https://www.lab2050.org/common/img/default_profile.png"
            }
            width={"80px"}
            height={"80px"}
            style={{ borderRadius: "50%" }}
            alt="profile"
          />
          <h4
            style={{
              marginRight: "15px",
              marginTop: "20px",
              marginLeft: "10px",
            }}
          >
            {user.userName} 님
          </h4>
          <span style={{ marginTop: "20px" }} className="chat-user-level">
            level.{user.level}
          </span>
        </div>
        <h6 style={{ marginTop: "30px", color: "#303030" }}>채팅 중인 이웃</h6>
        <div className="chat-user-scroll">
          {chatList.map((chat) => (
            <div className="chat-user-line" key={chat.chat_id}>
              <div
                style={{
                  display: "flex",
                  marginTop: "7px",
                  marginBottom: "7px",
                }}
              >
                <img
                  src={`http://sy2978.dothome.co.kr/userProfile/user_id_${
                    chat.user1_id === user.userID
                      ? chat.user2_id
                      : chat.user1_id
                  }.jpg`}
                  width={"72px"}
                  height={"72px"}
                  style={{ borderRadius: "50%" }}
                  alt="chat user"
                />
                <div style={{ flexDirection: "column" }}>
                  <h6
                    style={{
                      marginRight: "15px",
                      marginTop: "20px",
                      marginLeft: "10px",
                      cursor: "pointer",
                    }}
                  >
                    {chat.user1_id === user.userID
                      ? chat.user2_name
                      : chat.user1_name}
                  </h6>
                  <h6
                    className="myshop-level"
                    style={{
                      marginTop: "0px",
                      marginLeft: "10px",
                      color: "#464646",
                      fontSize: "small",
                    }}
                  >
                    {chat.last_message}
                  </h6>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-line"></div>

      <div style={{ margin: "20px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", marginTop: "7px", marginBottom: "7px" }}>
          <img
            src={`http://sy2978.dothome.co.kr/userProfile/user_id_${partnerID}.jpg`}
            width={"72px"}
            height={"72px"}
            style={{ borderRadius: "50%" }}
            alt="partner"
          />
          <h6
            style={{
              marginRight: "15px",
              marginTop: "20px",
              marginLeft: "10px",
            }}
          >
            {partnerName}
          </h6>
          <h6
            style={{ marginTop: "20px", color: "#FFD600" }}
            className="myshop-level"
          >
            level.4
          </h6>
        </div>
        <div className="chat2-user-line">
          <p className="chat-date" style={{ marginTop: "15px" }}>
            {mostRecentMessage?.timestamp
              ? new Date(mostRecentMessage.timestamp).toLocaleDateString(
                  "ko-KR",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )
              : "날짜 정보 없음"}
          </p>
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: "flex",
                justifyContent:
                  message.senderID === user.userID ? "flex-end" : "flex-start",
                marginTop: "7px",
                marginBottom: "7px",
              }}
            >
              {message.senderID === user.userID ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row-reverse",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <h6 className="real-chat-me" style={{ fontSize: "small" }}>
                    {message.message}
                  </h6>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={`http://sy2978.dothome.co.kr/userProfile/user_id_${message.senderID}.jpg`}
                    width={"47px"}
                    height={"47px"}
                    style={{ borderRadius: "50%", marginRight: "10px" }}
                    alt="sender"
                  />
                  <h6 className="real-chat" style={{ fontSize: "small" }}>
                    {message.message}
                  </h6>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />

          <form onSubmit={sendMessage} style={{ display: "flex" }}>
            <Form.Control
              type="text"
              placeholder="메시지를 입력해주세요."
              className="chat-ready"
              value={newMessage}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNewMessage(e.target.value)
              }
            />
            <button
              type="submit"
              className="chat-send-button"
              style={{ border: "none", background: "none" }}
            >
              <FontAwesomeIcon
                icon={faPaperPlane}
                className="chat-paper-plane"
                style={{ color: "#dcdcdc" }}
              />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChattingDetail;
