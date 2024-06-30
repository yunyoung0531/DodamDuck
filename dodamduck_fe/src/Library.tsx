import React, { useState, useEffect } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Card } from "react-bootstrap";
import axios from "axios";

interface LibraryItem {
  장난감명: string;
  사용연령: string;
  대여료: string;
}

const Library: React.FC = () => {
  const [libraries, setLibraries] = useState<LibraryItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://api.odcloud.kr/api/15044146/v1/uddi:7894ac31-fe17-420a-834a-824c42470e0e_201905301141?page=1&perPage=0&returnType=JSON&serviceKey=TrbCQQGmSeoFYVRPmlICZP8FAGgmE2MzDNTQg%2BsXuVem1UKSEzEnI3My8Ifq6FuxPAfbObQHFQB9hgomJO9NGg%3D%3D",
          {
            params: {
              page: 1,
              perPage: 30,
              returnType: "JSON",
            },
            headers: {
              Authorization:
                "TrbCQQGmSeoFYVRPmlICZP8FAGgmE2MzDNTQg+sXuVem1UKSEzEnI3My8Ifq6FuxPAfbObQHFQB9hgomJO9NGg==",
              accept: "*/*",
            },
          }
        );

        const uniqueData = Array.from(
          new Set(response.data.data.map((item: LibraryItem) => item.장난감명))
        )
          .map((uniqueName) => {
            return response.data.data.find(
              (item: LibraryItem) => item.장난감명 === uniqueName
            );
          })
          .sort((a: LibraryItem, b: LibraryItem) =>
            a.장난감명.localeCompare(b.장난감명)
          );
        console.log("uniqueData: ", uniqueData);

        setLibraries(uniqueData);

        console.log(uniqueData);
      } catch (error) {
        console.error("오류 뜸", error);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <div className="library-nav">
        <div className="library-comment1">원하는 장난감을 빌릴 수 있는</div>
        <div className="library-comment2">장난감 도서관</div>
      </div>

      <div className="lib-container">
        {libraries.map((library, index) => (
          <Card key={index} className="card-compo">
            <Card.Title style={{ fontSize: "21px" }}>
              {library?.장난감명}
            </Card.Title>
            <Card.Body>
              <Card.Img
                src={`http://sy2978.dothome.co.kr/library/${library?.장난감명.replace(
                  /\s/g,
                  ""
                )}.jpg`}
                style={{ width: "180px", height: "180px" }}
              />
              <Card.Text>
                사용연령: {library?.사용연령}
                <br />
                대여료: {library?.대여료}
              </Card.Text>
              <Button variant="dark" className="rental-btn">
                대여 문의
              </Button>
            </Card.Body>
          </Card>
        ))}
      </div>
    </>
  );
};

export default Library;
