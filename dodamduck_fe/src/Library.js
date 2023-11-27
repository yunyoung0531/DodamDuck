import React, { useState, useEffect } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 도담덕캐릭터 from './img/도담덕캐릭텨(누끼).png'
import { Button, Card } from 'react-bootstrap';
import axios from 'axios';

function Library() {
    const [libraries, setLibraries] = useState([]);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('https://api.odcloud.kr/api/15044146/v1/uddi:7894ac31-fe17-420a-834a-824c42470e0e_201905301141?page=1&perPage=24&returnType=JSON&serviceKey=TrbCQQGmSeoFYVRPmlICZP8FAGgmE2MzDNTQg%2BsXuVem1UKSEzEnI3My8Ifq6FuxPAfbObQHFQB9hgomJO9NGg%3D%3D', {
                    params: {
                        page: 1,
                        perPage: 24,
                        returnType: 'JSON',
                    },
                    headers: {
                        "Authorization": "TrbCQQGmSeoFYVRPmlICZP8FAGgmE2MzDNTQg+sXuVem1UKSEzEnI3My8Ifq6FuxPAfbObQHFQB9hgomJO9NGg==",
                        "accept": "*/*"
                    }
                });
                setLibraries(response.data.data);
            } catch (error) {
                console.error("오류 뜸!! 다시 해보자", error);
            }
        };
        fetchData();
    }, []);

    return(
        <>
            <div className='library-nav'>
            <div className='library-comment1'>
                원하는 장난감을 빌릴 수 있는
            </div>
            <div className='library-comment2'>
                장난감 도서관
            </div>
            </div>

            <div className='lib-container'>
                {/* <div style={{ paddingLeft: '-10px' }}> */}
            {libraries.map((library, index) => (
                <Card key={index} className='card-compo'>
                {/* <Card.Title>{library.관리기관명}</Card.Title> */}
                <Card.Title style={{ fontSize: '21px'}}>{library.장난감명}</Card.Title>
                <Card.Body>
                    <Card.Img src="https://search.pstatic.net/common/?src=http%3A%2F%2Fshopping.phinf.naver.net%2Fmain_3186478%2F31864788721.20220417025129.jpg&type=sc960_832" style={{ width: '180px', height: '180px'}}/>
                    <Card.Text>
                        {/* Some quick example text to build on the card title and make up the
                        bulk of the card's content. */}
                        사용연령: {library.사용연령}<br/>
                        대여료: {library.대여료}
                    </Card.Text>
                    <Button variant="dark" className='rental-btn'>대여 문의</Button>
                </Card.Body>
                </Card>
            ))}
            {/* </div> */}
            </div>
        </>
    )
}

export default Library;