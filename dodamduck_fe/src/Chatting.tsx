import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "./AuthContext";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Chat {
  chat_id: string;
  user1_id: string;
  user2_id: string;
  user1_name: string;
  user2_name: string;
  last_message: string;
}

const Chatting: React.FC = () => {
  const { user } = useAuth();
  const [chatList, setChatList] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("chatList가 업데이트 되었습니다: ", chatList);
  }, [chatList]);

  useEffect(() => {
    //비동기로 !user인지 체크
    if (!user) {
      const checkUser = setTimeout(() => {
        if (!user) {
          alert("로그인 후 이용해주세요");
          navigate("/login");
        } else {
          setIsLoading(false);
        }
      }, 1000); // 1초 후에 체크
      return () => clearTimeout(checkUser);
    } else {
      setIsLoading(false);
    }
  }, [navigate, user]);

  useEffect(() => {
    const fetchChatList = async () => {
      setIsLoading(true);
      const existingToken = localStorage.getItem("token");
      if (existingToken) {
        try {
          const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${existingToken}`,
          };
          const response = await axios.get(
            `http://sy2978.dothome.co.kr/get_chat_list.php?user_id=${user?.userID}`,
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
          if (error instanceof Error) {
            setError(error);
          }
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchChatList();
  }, [user, navigate]);

  const goToChatDetail = (
    ChatID: string,
    partnerID: string,
    partnerName: string,
    myID: string
  ) => {
    navigate(`/chattingDetail/${ChatID}/${partnerID}/${partnerName}/${myID}`);
  };

  return (
    <div className="chat-container">
      <div style={{ margin: "20px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img
            src={
              user?.profile_url ||
              "https://as2.ftcdn.net/v2/jpg/00/64/67/63/1000_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg"
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
              marginLeft: "18px",
            }}
          >
            {user?.userName} 님
          </h4>
          <span style={{ marginTop: "24px" }} className="chat-user-level">
            level.{user?.level}
          </span>
          {/* h7에서 span 으로 변경 */}
        </div>

        <h6 style={{ marginTop: "30px", color: "#303030" }}>채팅 중인 이웃</h6>
        <div className="chat-user-scroll">
          {chatList.map((chat) => (
            <div
              className="chat-user-line"
              key={chat.chat_id}
              onClick={() =>
                goToChatDetail(
                  chat.chat_id,
                  chat.user1_id === user?.userID
                    ? chat.user2_id
                    : chat.user1_id,
                  chat.user1_id === user?.userID
                    ? chat.user2_name
                    : chat.user1_name,
                  user?.userID || ""
                )
              }
            >
              <div
                style={{
                  display: "flex",
                  marginTop: "7px",
                  marginBottom: "7px",
                }}
              >
                <img
                  src={`http://sy2978.dothome.co.kr/userProfile/user_id_${
                    chat.user1_id === user?.userID
                      ? chat.user2_id
                      : chat.user1_id
                  }.jpg`}
                  width={"72px"}
                  height={"72px"}
                  style={{ borderRadius: "50%" }}
                  onError={(e) =>
                    (e.currentTarget.src =
                      "https://as2.ftcdn.net/v2/jpg/00/64/67/63/1000_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg")
                  }
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
                    {chat.user1_id === user?.userID
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
      <div
        style={{
          flexDirection: "column",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <FontAwesomeIcon
          icon={faComments}
          style={{ color: "#d6d6d6", fontSize: "95px", marginLeft: "275px" }}
        />
        <p
          className="recent-chat-comment"
          style={{
            display: "flex",
            justifyContent: "center",
            textAlign: "center",
            alignItems: "center",
            marginLeft: "270px",
            marginTop: "15px",
          }}
        >
          채팅할 상대를 선택해주세요
        </p>
      </div>
    </div>
  );
};

export default Chatting;
