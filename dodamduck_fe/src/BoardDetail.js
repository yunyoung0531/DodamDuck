import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Card, ListGroup } from 'react-bootstrap';
import axios from 'axios';

function BoardDetail() {
    let { id } = useParams();

    const [contentShare, setContentShare] = useState(null); // 게시물 데이터 상태
    const [contentComments, setContentComments] = useState([]); // 댓글 데이터 상태

    useEffect(() => {
        const fetchDetail = async () => {
        try {
            // 게시물 상세 정보를 불러오는 API 호출
            const response = await axios.get(`http://sy2978.dothome.co.kr/ContentShare_ID.php?share_id=${id}`);
            setContentShare(response.data.ContentShare); // 상태 업데이트
            setContentComments(response.data.ContentComments);  
            console.log(id);
            console.log(response.data);
        } catch (error) {
        console.error('실패함', error);
        }
    };

    fetchDetail();
    }, [id]); 

    if (!contentShare) {
        return <div>로딩중...</div>; // 데이터 로딩 중 표시
    }

    return (
        <>
        {/* Post ID: {id} */}
        <div className="shring-detail-card">
            <Card className="text-center">
            <Card.Header>도담덕 자유 게시판

            </Card.Header>
            <Card.Body>
            <Card.Img variant="top" src="https://static.hyundailivart.co.kr/upload_mall/board/ME00000044/B200025249/B200025249_mnImgPathFile_20210520150319893.jpeg/dims/autorotate/on" width={'100px'} height={'460px'} />
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
                        <h5>{contentShare?.Title}</h5> 
                        <h5 className="sharing-detail-content">
                            {contentShare?.Content}
                        </h5>
                        </div>
                    </ListGroup.Item>
                    {/* <ListGroup.Item></ListGroup.Item> */}
                </ListGroup>
                <ListGroup className="list-group-flush">
                    {contentComments.map((comment, index) => (
                        <ListGroup.Item key={index}>{comment.Comment}</ListGroup.Item>
                    ))}
                </ListGroup>
            </Card.Body>
            <Card.Footer className="text-muted">게시글 목록 보기</Card.Footer>
            </Card>
        </div>
        </>
    )
}

export default BoardDetail;