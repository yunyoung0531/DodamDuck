import { Tab, Tabs } from "react-bootstrap";
import { useAuth } from "./AuthContext";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  user_id: string;
  post_id: string;
  title: string;
  [key: string]: any; // 추가 필드가 있을 경우를 대비한 타입
}

const MyShop: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  console.log("myshop-지금 로그인된 사람은? ", user);

  useEffect(() => {
    if (!user) {
      const checkUser = setTimeout(() => {
        if (!user) {
          alert("로그인 후 이용해주세요");
          navigate("/login");
        } else {
          setLoading(false);
        }
      }, 1000); // 1초 후에 체크
      return () => clearTimeout(checkUser);
    } else {
      setLoading(false);
    }
  }, [navigate, user]);

  useEffect(() => {
    const fetchProducts = async () => {
      const existingToken = localStorage.getItem("token");
      if (existingToken && user) {
        try {
          const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${existingToken}`,
          };
          const response = await axios.get(
            "http://sy2978.dothome.co.kr/Post.php",
            { headers }
          );
          if (response.status === 200) {
            const userProducts = response.data.filter(
              (product: Product) => product.user_id === user.userID
            );
            setProducts(userProducts);
          } else {
            console.error("불러오기 실패", response.data.message);
          }
        } catch (error) {
          console.error("상품 로딩 중 에러 발생", error);
        }
      }
    };

    fetchProducts();
  }, [user]);

  const incrementViewCount = async (postId: string) => {
    try {
      const existingToken = localStorage.getItem("token");
      if (existingToken) {
        const postData = new URLSearchParams();
        postData.append("post_id", postId);
        const headers = {
          Authorization: `Bearer ${existingToken}`,
        };
        const response = await axios.post(
          "http://sy2978.dothome.co.kr/upload_post_view_up.php",
          postData,
          { headers }
        );
        console.log("조회수 증가 응답", response.data);
      } else {
        console.error("토큰이 없어 조회수를 증가시킬 수 없습니다.");
      }
    } catch (error) {
      console.error("조회수 증가 API 호출 실패", error);
    }
  };

  const handleCardClick = (postId: string) => {
    incrementViewCount(postId);
    navigate(`/sharingDetail/${postId}`);
  };

  return (
    <>
      <div
        className="myshop-container"
        style={{ display: "flex", alignItems: "center" }}
      >
        <div style={{ margin: "60px" }}>
          <img
            src={
              user?.profile_url ||
              "https://as2.ftcdn.net/v2/jpg/00/64/67/63/1000_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg"
            }
            width={"140px"}
            height={"140px"}
            style={{ borderRadius: "50%" }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <h4 style={{ marginRight: "30px" }}>
            {user?.userName}({user?.userID}) 님
          </h4>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: "40px",
              marginLeft: "-218px",
            }}
            className="myshop-information"
          >
            <p className="myshop-level">level.{user?.level}</p>
            <p className="myshop-level">
              {" "}
              인증 횟수: {user?.verification_count}
            </p>
            <p className="myshop-level"> 위치: {user?.location}</p>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: "1108px", margin: "auto" }}>
        <Tabs
          defaultActiveKey="home"
          id="uncontrolled-tab-example"
          className="mb-3"
        >
          <Tab eventKey="home" title="상품">
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {products.map((product) => (
                <div
                  key={product.id}
                  style={{
                    margin: "20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "140px",
                  }}
                >
                  <div style={{ margin: "20px" }}>
                    <img
                      src={`http://sy2978.dothome.co.kr/uploads/post_id${product.post_id}.jpg`}
                      width={"140px"}
                      height={"140px"}
                      style={{
                        borderRadius: "5%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "6px",
                        cursor: "pointer",
                      }}
                      onClick={() => handleCardClick(product.post_id)}
                    />
                    <h6
                      style={{
                        display: "flex",
                        textAlign: "center",
                        justifyContent: "center",
                      }}
                      className="myshop-product"
                    >
                      {product.title}
                    </h6>
                  </div>
                </div>
              ))}
            </div>
          </Tab>
          <Tab eventKey="profile" title="하트목록">
            (준비중😭)
          </Tab>
        </Tabs>
      </div>
    </>
  );
};

export default MyShop;
