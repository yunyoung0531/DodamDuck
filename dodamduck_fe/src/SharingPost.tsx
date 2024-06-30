import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import { Card, Button, Form } from "react-bootstrap";
import React, { useState, ChangeEvent, KeyboardEvent } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { usePost } from "./PostContext";

const SharingPost: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setPosts } = usePost();

  const [inputValue, setInputValue] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [exchangeOption, setExchangeOption] = useState<string>("");
  const [wishedLocation, setWishedLocation] = useState<string>("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " ") {
      setTags([...tags, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImages([file]);
    }
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handleRadioChange = (e: ChangeEvent<HTMLInputElement>) => {
    setExchangeOption(e.target.value);
  };

  const handleWishedLocationChange = (e: ChangeEvent<HTMLInputElement>) => {
    setWishedLocation(e.target.value);
  };

  const handlePostSubmit = async () => {
    if (!user) {
      console.error("User not logged in");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", user.userID);
    formData.append("category_id", "1");
    formData.append("title", title);
    formData.append("content", description);
    formData.append("location", wishedLocation);
    formData.append("exchangeOption", exchangeOption);
    formData.append("tags", JSON.stringify(tags));

    if (selectedImages.length > 0) {
      formData.append("image", selectedImages[0]);
    }

    const existingToken = localStorage.getItem("token");
    if (existingToken) {
      try {
        const response = await axios.post(
          "http://sy2978.dothome.co.kr/PostWrite.php",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${existingToken}`,
            },
          }
        );
        if (response.status === 200 && response.data.error === false) {
          console.log("게시글이 성공적으로 등록되었습니다.");
          const newPost = response.data.post;
          setPosts((prevPosts) => [...prevPosts, newPost]);
          navigate("/sharingBoard");
        } else {
          console.error("게시글 등록에 실패했습니다.");
        }
      } catch (error) {
        console.error("게시글을 등록하는 동안 오류가 발생했습니다.", error);
      }
    }
  };

  return (
    <>
      <div className="sharing-post-comment">교환 & 나눔 글 올리기 🖤</div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          className="sharing-post-container"
          style={{ flexDirection: "column" }}
        >
          <div style={{ display: "flex" }}>
            <div style={{ margin: "20px" }}>상품이미지</div>
            <Card
              style={{
                width: "10rem",
                height: "10rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f8f8f8",
                margin: "20px",
                cursor: "pointer",
                marginLeft: "40px",
              }}
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              <FontAwesomeIcon
                icon={faCamera}
                style={{
                  color: "#bbbbbb",
                  fontSize: "30px",
                  fontWeight: "100 !important",
                }}
              />
              <div
                style={{
                  color: "#6c6c6c",
                  fontSize: "11px",
                  marginTop: "10px",
                }}
              >
                이미지 추가
              </div>
            </Card>
            {selectedImages.map((image, index) => (
              <Card
                key={index}
                style={{
                  width: "10rem",
                  height: "10rem",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#f8f8f8",
                  margin: "20px",
                  cursor: "pointer",
                }}
                onClick={() => document.getElementById("fileInput")?.click()}
              >
                <img
                  src={URL.createObjectURL(image)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "3%",
                  }}
                />
              </Card>
            ))}
            <input
              type="file"
              id="fileInput"
              style={{ display: "none" }}
              onChange={handleImageChange}
              accept="image/*"
            />
          </div>
          <div style={{ display: "flex" }}>
            <div style={{ margin: "20px" }}>상품명</div>
            <Form.Control
              type="text"
              placeholder="상품명을 등록해주세요"
              onChange={handleTitleChange}
              style={{
                width: "35rem",
                height: "3rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f8f8f8",
                margin: "20px",
                marginLeft: "77px",
              }}
            />
          </div>
          <div style={{ display: "flex" }}>
            <div style={{ margin: "20px" }}>상품설명</div>
            <Form.Control
              as="textarea"
              placeholder="구매시기, 브랜드/모델명, 제품의 상태 (사용감, 하자 유무) 등을 입력해 주세요.                 서로가 믿고 거래할 수 있도록, 자세한 정보을 올려주세요."
              onChange={handleDescriptionChange}
              style={{
                width: "38rem",
                height: "10rem",
                textAlign: "left",
                verticalAlign: "top",
                backgroundColor: "#f8f8f8",
                margin: "20px",
                marginLeft: "57px",
              }}
            />
          </div>
          <div style={{ display: "flex" }}>
            <div style={{ margin: "20px" }}>거래 희망 장소</div>
            <Form.Control
              type="text"
              placeholder="거래 희망 장소를 입력해주세요."
              onChange={handleWishedLocationChange}
              style={{
                width: "38rem",
                height: "3rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f8f8f8",
                margin: "20px",
                marginLeft: "4px",
              }}
            />
          </div>
          <div style={{ display: "flex" }}>
            <div style={{ margin: "20px" }}>교환/나눔</div>
            <Form className="post-radio">
              <Form.Check
                inline
                label="교환"
                name="group1"
                type="radio"
                value="교환"
                onChange={handleRadioChange}
                id={`inline-radio-1`}
              />
              <Form.Check
                inline
                label="나눔"
                name="group1"
                type="radio"
                value="나눔"
                onChange={handleRadioChange}
                id={`inline-radio-2`}
              />
            </Form>
          </div>
          <div style={{ display: "flex" }}>
            <div style={{ margin: "20px" }}>해시태그</div>
            <div style={{ marginLeft: "13px" }}>
              {tags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    backgroundColor: "white",
                    padding: "6px 11px",
                    borderRadius: "20px",
                    border: "0.7px solid #a9a9a9",
                    marginLeft: "40px",
                    color: "#424242",
                    fontSize: "17px",
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              width: "30rem",
              height: "3rem",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#f8f8f8",
              margin: "20px",
              marginLeft: "170px",
              marginTop: "-34px",
            }}
          >
            <Form.Control
              type="text"
              placeholder="태그를 입력하시고 스페이스바를 누르세요"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              style={{
                width: "30rem",
                height: "3rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f8f8f8",
                margin: "20px",
                marginLeft: "170px",
                marginTop: "-34px",
              }}
            />
          </div>
          <div style={{ display: "flex" }}>
            <Button
              variant="outline-dark"
              className="register-btn"
              onClick={() => {
                handlePostSubmit();
                navigate("/sharingBoard");
              }}
            >
              등록
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SharingPost;
