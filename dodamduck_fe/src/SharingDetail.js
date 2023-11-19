import { useParams } from "react-router-dom";
import { Button, Card, ListGroup } from "react-bootstrap";
import axios from 'axios';
import {React, useState, useEffect } from 'react';


function SharingDetail() {

    let { id } = useParams();
    const [postDetail, setPostDetail] = useState(null);

    useEffect(() => {
        const fetchPostDetail = async () => {
            try {
                const postData = new URLSearchParams();
                postData.append('post_id', id);

                const response = await axios.post('http://sy2978.dothome.co.kr/PostDetail.php', postData);
                setPostDetail(response.data);
            } catch (error) {
                console.error('실패함', error);
            }
        };

        fetchPostDetail();
    }, [id]);

    if (!postDetail || !postDetail.post || postDetail.post.length === 0) {
        return <div>로딩중입니다.</div>
    }
    const { title, content } = postDetail.post;

    return (
        <>
        {/* Post ID: {id} */}
        <div className="shring-detail-card">
            <Card className="text-center">
            <Card.Header>교환 & 나눔 게시판

            </Card.Header>
            <Card.Body>
            <Card.Img variant="top" src="https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9788964130193.jpg" width={'100px'} height={'460px'} />
                <Card.Title style={{marginTop: '20px'}}>
                    <div style={{display: 'flex', marginLeft: '15px'}}>
                        <img src="https://i1.sndcdn.com/avatars-000773808259-oqqdgp-t240x240.jpg" width={'65px'} height={'65px'} style={{borderRadius: '50%'}}/>
                        <div style={{display: 'flex', flexDirection: 'column'}}>
                            {/* <div style={{display: 'flex'}}> */}
                            <h5 style={{marginLeft: '-456px'}}>보노보노맘</h5>
                            {/* </div> */}
                            {/* <div style={{display: 'flex'}}> */}
                            <div style={{ display: 'flex',justifyContent: 'flex-end'}}>
                            <h6 className="upload-date">글 올린 시간</h6>
                            <Button className="chatting-btn">채팅하기</Button>
                            </div>
                        </div>
                    </div>
                </Card.Title>
                <ListGroup className="list-group-flush">
                    <ListGroup.Item></ListGroup.Item>
                    <ListGroup.Item>
                        <div style={{display: 'flex', alignItems: 'start', flexDirection: 'column'}}>
                        <h5>{title}</h5> 
                        {/* <h5 className="sharing-detail-content">뽀로로 장난감 다른 거랑 교환 원해요!!
                        아무말이란 아무말 입니다. ←이런 게 아무말이다.
                        뜻 풀이
                        특별한 의도가 없이 머릿속에서 생각난 채로 정제하지 않고 바로바로 쏟아내는 말.
                        1의 의미에 더해, 특히 그것이 듣는 사람에게 매우 실례되는 경우를 지칭하는 말.
                        듣는 사람으로 하여금 해석이 안 되게끔 하는 말.
                        비슷한 말
                        아무말 대잔치!
                        특정 글이나 댓글의 내용이 정연하지 않고 다수가 엉뚱한 말을 하고 있음을 표현함.
                        의식의 흐름
                        원래는 문학 용어 중 하나인데 그건 상관없고 그냥 아무말이랑 비슷한 뉘앙스로 쓰인다. 아무말아무말아무말아무말아무말아
                        </h5> */}
                        <h5 className="sharing-detail-content">
                        {content}
                        </h5>
                        </div>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        {postDetail.comments.map((comment, index) => (
                        <ListGroup.Item key={index}>
                            <p>{comment.content}</p>
                        </ListGroup.Item>
                        ))}
                    </ListGroup.Item>
                </ListGroup>
                <Card.Text style={{display: 'flex', alignItems: 'flex-start', marginLeft: '15px'}}>
                #해시태그 #교환
                </Card.Text>
            </Card.Body>
            <Card.Footer className="text-muted">2 days ago</Card.Footer>
            </Card>
        </div>
        </>
    )
}

export default SharingDetail;