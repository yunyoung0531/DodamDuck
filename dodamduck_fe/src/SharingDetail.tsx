import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, ListGroup, Form } from "react-bootstrap";
import axios from "axios";
import React, { useState, useEffect, ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faTrashCan,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "./AuthContext";

interface Comment {
  id: string;
  userName: string;
  content: string;
  created_at: string;
}

interface PostDetail {
  post: {
    id: string;
    title: string;
    content: string;
    views: number;
    location: string;
    userName: string;
    image_url: string;
    created_at: string;
    profile_url?: string;
  };
  comments: Comment[];
}

const SharingDetail: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [postDetail, setPostDetail] = useState<PostDetail | null>(null);
  const navigate = useNavigate();
  const [comment, setComment] = useState<string>("");

  const handleCommentChange = (e: ChangeEvent<HTMLInputElement>) => {
    setComment(e.target.value);
  };

  //댓글 달기
  const submitComment = async () => {
    const existingToken = localStorage.getItem("token");
    if (existingToken && user) {
      try {
        const formData = new FormData();
        formData.append("post_id", id as string);
        formData.append("user_id", user.userID);
        formData.append("content", comment);

        const response = await axios.post(
          "http://sy2978.dothome.co.kr/upload_comments.php",
          formData,
          {
            headers: { Authorization: `Bearer ${existingToken}` },
          }
        );

        if (response.status === 200 && response.data.error === false) {
          const newComment: Comment = {
            id: response.data.comment_id,
            userName: user.userName,
            content: comment,
            created_at: new Date().toISOString(),
          };

          setPostDetail((prevDetail) =>
            prevDetail
              ? {
                  ...prevDetail,
                  comments: [...prevDetail.comments, newComment],
                }
              : null
          );
          setComment("");
        } else {
          console.error("댓글 등록에 실패했습니다.");
        }
      } catch (error) {
        console.error("댓글을 등록하는 동안 오류가 발생했습니다.", error);
      }
    }
  };

  useEffect(() => {
    const fetchPostDetail = async () => {
      const existingToken = localStorage.getItem("token");
      if (existingToken) {
        try {
          const headers = {
            Authorization: `Bearer ${existingToken}`,
          };
          const postData = new URLSearchParams();
          postData.append("post_id", id as string);
          const response = await axios.post(
            "http://sy2978.dothome.co.kr/PostDetail.php",
            postData,
            { headers }
          );
          if (response.status === 200 && response.data) {
            setPostDetail(response.data);
          }
        } catch (error) {
          console.error("실패함", error);
        }
      }
    };
    fetchPostDetail();
  }, [id]);

  /**
   * 게시글 삭제
   */
  const deletePost = async () => {
    if (user) {
      const existingToken = localStorage.getItem("token");
      try {
        const response = await axios.delete(
          `http://sy2978.dothome.co.kr/PostDelete.php`,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Bearer ${existingToken}`,
            },
            data: new URLSearchParams({
              post_id: id as string,
              user_id: user.userID,
            }).toString(),
          }
        );

        if (response.status === 200 && response.data.error === "false") {
          navigate("/sharingBoard");
        } else {
          console.error("게시물 삭제에 실패했습니다.", response.data.message);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(
            "게시물을 삭제하는 동안 오류가 발생했습니다.",
            error.message
          );
        }
      }
    }
  };

  const createChatRoom = async () => {
    if (user) {
      const existingToken = localStorage.getItem("token");
      if (existingToken) {
        try {
          const formData = new FormData();
          formData.append("post_id", id as string);
          formData.append("user_id", user.userID);

          const response = await axios.post(
            "http://sy2978.dothome.co.kr/create_chat_room.php",
            formData,
            {
              headers: { Authorization: `Bearer ${existingToken}` },
            }
          );

          if (response.status === 200 && response.data.error === false) {
            navigate("/chatting");
          } else {
            console.error("채팅방 생성에 실패했습니다.", response.data.message);
          }
        } catch (error) {
          console.error("채팅방을 생성하는 동안 오류가 발생했습니다.", error);
        }
      }
    }
  };

  if (!postDetail || !postDetail.post) {
    return <div>로딩중입니다.</div>;
  }

  const {
    title,
    content,
    views,
    location,
    userName,
    image_url,
    created_at,
    profile_url,
  } = postDetail.post;

  return (
    <div className="sharing-detail-card">
      <Card className="text-center">
        <Card.Header>교환 & 나눔 게시판</Card.Header>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ flex: 1 }}>
            <Card.Body>
              <Card.Img
                variant="top"
                src={image_url}
                width={"100px"}
                height={"460px"}
              />
              <Card.Title style={{ marginTop: "20px" }}>
                <div
                  style={{
                    display: "flex",
                    marginLeft: "15px",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex" }}>
                    <img
                      src={
                        profile_url
                          ? profile_url
                          : "https://www.lab2050.org/common/img/default_profile.png"
                      }
                      width={"65px"}
                      height={"65px"}
                      style={{ borderRadius: "50%" }}
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <h5 style={{ display: "flex", marginLeft: "15px" }}>
                        {userName}님
                      </h5>
                      <div style={{ display: "flex" }}>
                        <h6 className="upload-date">{location}</h6>
                        <p
                          className="sharing-comment-created"
                          style={{ marginTop: "3px", marginLeft: "8px" }}
                        >
                          {created_at}
                        </p>
                      </div>
                    </div>
                  </div>
                  {user && user.userName !== userName && (
                    <Button
                      className="sharing-chatting-btn"
                      onClick={createChatRoom}
                    >
                      채팅하기
                    </Button>
                  )}
                </div>
              </Card.Title>
            </Card.Body>
          </div>
          <div className="board-detail-line"></div>
          <div style={{ flex: 1, padding: "20px" }}>
            {" "}
            {/* 두번째 섹션 */}
            <ListGroup className="list-group-flush">
              <ListGroup.Item>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h5 className="font-border">{title}</h5>
                  <div className="sharing-views">조회수: {views}</div>
                </div>
                <h5 className="sharing-detail-content">
                  {content}
                  <div className="sharing-delete">
                    {user &&
                      postDetail &&
                      user.userName === postDetail.post.userName && (
                        <>
                          <FontAwesomeIcon
                            icon={faPen}
                            style={{
                              color: "#4d4d4d",
                              marginRight: "7px",
                              cursor: "pointer",
                            }}
                          />
                          <FontAwesomeIcon
                            icon={faTrashCan}
                            style={{ color: "#4d4d4d", cursor: "pointer" }}
                            onClick={deletePost}
                          />
                        </>
                      )}
                  </div>
                </h5>
              </ListGroup.Item>
              <Card.Text
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  marginLeft: "15px",
                  marginTop: "10px",
                }}
                className="font-border"
              >
                #해시태그 #나눔
              </Card.Text>
            </ListGroup>
            <ListGroup.Item className="comment-section">
              <div className="page-container">
                <div className="content-wrapper">
                  <ListGroup.Item className="comment-section">
                    <div className="comment-radio font-border">댓글</div>
                    <div
                      className="comment-content"
                      style={{ maxHeight: "350px", overflowY: "auto" }}
                    >
                      {postDetail.comments.map((comment) => (
                        <div key={comment.id}>
                          <div className="sharing-comment-style">
                            <p className="sharing-comment">
                              {comment.userName}님
                            </p>
                            <p className="sharing-comment-created">
                              {comment.created_at}
                            </p>
                          </div>
                          <div style={{ marginLeft: "10px" }}>
                            <p className="sharing-comment-content">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ListGroup.Item>
                </div>
                {user && (
                  <div className="comment-section">
                    <Form.Control
                      type="text"
                      placeholder="댓글을 입력해주세요."
                      className="comment-ready"
                      value={comment}
                      onChange={handleCommentChange}
                    />
                    <FontAwesomeIcon
                      icon={faPaperPlane}
                      style={{
                        color: "#dcdcdc",
                        marginLeft: "10px",
                        cursor: "pointer",
                        marginTop: "-22px",
                      }}
                      onClick={submitComment}
                    />
                  </div>
                )}
              </div>
            </ListGroup.Item>
          </div>
        </div>
        <Card.Footer
          className="text-muted"
          onClick={() => {
            navigate("/sharingBoard");
          }}
          style={{ cursor: "pointer" }}
        >
          교환/나눔 게시글 목록보기
        </Card.Footer>
      </Card>
    </div>
  );
};

export default SharingDetail;
