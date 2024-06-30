import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { Card, Form } from "react-bootstrap";
import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

interface Post {
  post_id: string;
  image_url: string;
  title: string;
  location: string;
  created_at: string;
  views: number;
  category_name: string;
  tags?: string[];
  tag?: string;
  [key: string]: any; // 추가 필드가 있을 경우를 대비한 타입
}

interface PopularSearch {
  query: string;
}

const SharingBoard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [serverPosts, setServerPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [popularSearches, setPopularSearches] = useState<PopularSearch[]>([]);

  useEffect(() => {
    const fetchSharingList = async () => {
      const existingToken = localStorage.getItem("token");
      if (existingToken) {
        try {
          const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${existingToken}`,
          };
          const response = await axios.get(
            "http://sy2978.dothome.co.kr/Post.php",
            { headers }
          );
          if (response.status === 200 && response.data) {
            setServerPosts(response.data);
          } else {
            console.log("No SharingBoard!!");
          }
        } catch (e) {
          console.log("교환/나눔 불러오기 실패", e);
        }
      }
    };
    fetchSharingList();
  }, []);

  useEffect(() => {
    fetchPopularSearches();
  }, []);

  const incrementViewCount = async (postId: string) => {
    try {
      const existingToken = localStorage.getItem("token");
      if (existingToken) {
        const postData = new URLSearchParams();
        postData.append("post_id", postId);
        const headers = { Authorization: `Bearer ${existingToken}` };
        const response = await axios.post(
          "http://sy2978.dothome.co.kr/upload_post_view_up.php",
          postData,
          { headers }
        );
        console.log("조회수 증가 응답", response.data);
      }
    } catch (error) {
      console.error("조회수 증가 API 호출 실패", error);
    }
  };

  const handleCardClick = (postId: string) => {
    if (user) {
      incrementViewCount(postId);
      navigate(`/sharingDetail/${postId}`);
    } else {
      alert("로그인 후 이용해주세요 :)");
      navigate("/login");
    }
  };

  const timeSince = (date: string) => {
    const postDate = new Date(date);
    const today = new Date();
    const differenceInTime = today.getTime() - postDate.getTime();
    const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));

    if (differenceInDays === 0) {
      return "오늘";
    } else if (differenceInDays === 1) {
      return "1일 전";
    } else {
      return `${differenceInDays}일 전`;
    }
  };

  const fetchPosts = async (query = "") => {
    const url = query
      ? `http://sy2978.dothome.co.kr/SearchQuery.php?query=${query}`
      : "http://sy2978.dothome.co.kr/Post.php";
    try {
      const existingToken = localStorage.getItem("token");
      if (existingToken) {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${existingToken}`,
        };
        const response = await axios.get(url, { headers });
        console.log("검색어는? ", response.data);
        setServerPosts(response.data);
      }
    } catch (error) {
      console.error("오류뜸: ", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const executeSearch = (event: FormEvent) => {
    event.preventDefault();
    fetchPosts(searchQuery);
  };

  const fetchPopularSearches = async () => {
    try {
      const existingToken = localStorage.getItem("token");
      if (existingToken) {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${existingToken}`,
        };
        const response = await axios.get(
          "http://sy2978.dothome.co.kr/PopularPostSearch.php",
          { headers }
        );
        if (response.status === 200 && response.data) {
          setPopularSearches(response.data);
        }
        console.log("인기 검색어 조회 성공:", response);
      }
    } catch (error) {
      console.error("인기 검색어 조회 실패:", error);
    }
  };

  return (
    <>
      <div className="library-nav">
        <div className="library-comment1">나눔을 통해 행복을 나누다</div>
        <div className="library-comment2">교환 & 나눔</div>
        <Form onSubmit={executeSearch}>
          <div className="search-bar">
            <Form.Control
              size="lg"
              type="text"
              placeholder="어떤 제품을 찾으세요?"
              className="search-form"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              size="lg"
              className="search-icon"
              onClick={executeSearch}
            />
          </div>
          <div>
            {popularSearches.slice(0, 5).map((search, index) => (
              <span key={index} className="popular-searching">
                #{search.query}{" "}
              </span>
            ))}
          </div>
        </Form>
      </div>
      <div className="container">
        <div
          className="row"
          style={{
            margin: "10px",
            width: "75rem",
            display: "flex",
            alignItems: "center",
          }}
        >
          {serverPosts.map((post) => (
            <div
              className="col-md-3"
              key={post.post_id}
              onClick={() => handleCardClick(post.post_id)}
            >
              <Card className="sharing-card">
                <div style={{ overflow: "hidden", height: "200px" }}>
                  <div
                    className="sharing-card-image-container"
                    style={{ height: "200px", overflow: "hidden" }}
                  >
                    <Card.Img
                      variant="top"
                      src={post.image_url}
                      className="sharing-custom-card-img"
                    />
                  </div>
                </div>
                <Card.Body className="sharing-card-body">
                  <Card.Title className="sharing-card-title">
                    {post.title}
                  </Card.Title>
                  <Card.Text className="sharing-card-info">
                    {post.location}ㆍ{timeSince(post.created_at)}ㆍ조회{" "}
                    {post.views}
                  </Card.Text>
                  <Card.Text className="sharing-card-content">
                    {post.category_name}
                  </Card.Text>
                  <Card.Text>
                    {post.tags &&
                      post.tags.map((tag, tagIndex) => (
                        <span key={tagIndex}>#{tag}</span>
                      ))}
                    {post.tag && <span>{post.tag}</span>}
                  </Card.Text>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      </div>
      {user && (
        <div
          className="circle"
          onClick={() => {
            navigate("/sharingPost");
          }}
        >
          <FontAwesomeIcon icon={faPlus} className="plus-sign" />
        </div>
      )}
    </>
  );
};

export default SharingBoard;
