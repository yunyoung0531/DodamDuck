import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Button, Card, ListGroup, Form } from "react-bootstrap";
import axios from 'axios';
import {React, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

function SharingDetail() {

    let { id } = useParams();
    const [postDetail, setPostDetail] = useState(null);
    let navigate = useNavigate();

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
    const { title, content, views, location, userName, image_url } = postDetail.post;

    return (
        <>
        {/* Post ID: {id} */}
        <div className="shring-detail-card">
            <Card className="text-center">
            <Card.Header>교환 & 나눔 게시판

            </Card.Header>
            <Card.Body>
            <Card.Img variant="top" src={image_url} width={'100px'} height={'460px'} />
                <Card.Title style={{marginTop: '20px'}}>
                    <div style={{display: 'flex', marginLeft: '15px'}}>
                        <img src="https://i1.sndcdn.com/avatars-000773808259-oqqdgp-t240x240.jpg" width={'65px'} height={'65px'} style={{borderRadius: '50%'}}/>
                        <div style={{display: 'flex', flexDirection: 'column'}}>
                            {/* <div style={{display: 'flex'}}> */}
                            <h5 style={{marginLeft: '-456px'}}>보노보노맘</h5>
                            {/* </div> */}
                            {/* <div style={{display: 'flex'}}> */}
                            <div style={{ display: 'flex',justifyContent: 'flex-end'}}>
                            <h6 className="upload-date">{location}</h6>
                            <Button className="sharing-chatting-btn">채팅하기</Button>
                            </div>
                        </div>
                    </div>
                </Card.Title>
                <ListGroup className="list-group-flush">
                    <ListGroup.Item></ListGroup.Item>
                    <ListGroup.Item>
                        <div style={{display: 'flex', justifyContent: "space-between", alignItems: 'center'}}>
                        <h5>{title}</h5> 
                        <div className="sharing-views">조회수: {views}</div>
                        </div>
                        <h5 className="sharing-detail-content">
                        {content}
                        </h5>
                    </ListGroup.Item>
                    <Card.Text style={{display: 'flex', alignItems: 'flex-start', marginLeft: '15px', marginTop: '10px'}}>
                        #해시태그 #나눔
                    </Card.Text>    
                    <ListGroup.Item  className="comment-section">
                        <div className="comment-radio">댓글</div>
                        <div className="comment-content">
                            {postDetail.comments.map((comment, index) => (
                                <div key={index} style={{ marginLeft: '10px'}}>
                                    <p className="sharing-comment">{userName}님: {comment.content}</p>
                                </div>
                            ))}
                        </div>
                                            
                    <div style={{ display: 'flex'}}>
                    <Form.Control type="text" placeholder="댓글을 입력해주세요." className="comment-ready"/> 
                        <FontAwesomeIcon icon={faPaperPlane} style={{color: "#dcdcdc", marginTop: '37px', marginLeft: '10px', cursor: 'pointer'}} />
                    </div>
                    </ListGroup.Item>
                </ListGroup>
                
            </Card.Body>
            <Card.Footer className="text-muted" onClick={()=>{navigate('/sharingBoard')}} style={{cursor: 'pointer'}}>교환/나눔 게시글 목록보기</Card.Footer>
            </Card>
        </div>
        </>
    )
}

export default SharingDetail;