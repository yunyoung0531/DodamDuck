import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Button, Card, ListGroup, Form } from "react-bootstrap";
import axios from 'axios';
import {React, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

function BoardDetail() {
    let { id } = useParams();

    let navigate = useNavigate();

    const [contentShare, setContentShare] = useState(null); // 게시물 데이터 상태
    const [ContentComments, setContentComments] = useState([]); // 댓글 데이터 상태

    useEffect(() => {
        const fetchDetail = async () => {
        try {
            const response = await axios.get(`http://sy2978.dothome.co.kr/ContentShare_Detail.php?share_id=${id}`);
            setContentShare(response.data.post); 
            setContentComments(response.data.comments);  
            console.log(id);
            console.log(response.data);
        } catch (error) {
        console.error('실패함', error);
        }
    };

    fetchDetail();
    }, [id]); 

    if (!contentShare) {
        return <div>로딩중...</div>;
    }

    return (
        <>
        {/* Post ID: {id} */}
        <div className="shring-detail-card">
            <Card className="text-center">
            <Card.Header>도담덕 자유 게시판

            </Card.Header>
            <Card.Body>  
            <Card.Img variant="top" src={contentShare?.image_url} width={'100px'} height={'460px'} />
                <Card.Title style={{marginTop: '20px'}}>
                    <div style={{display: 'flex', marginLeft: '15px'}}>
                        <img src={contentShare?.profile_url ? contentShare.profile_url : 'https://www.lab2050.org/common/img/default_profile.png'}  width={'65px'} height={'65px'} style={{borderRadius: '50%'}}/>
                        <div style={{display: 'flex', flexDirection: 'column'}}>
                            {/* <div style={{display: 'flex'}}> */}
                            {/* <h5 style={{marginLeft: '-480px'}}>{contentShare?.userName}님</h5> */}
                            <h5 style={{marginLeft: '-480px'}}>{contentShare?.UserID}님</h5>
                            {/* </div> */}
                            {/* <div style={{display: 'flex'}}> */}
                            <div style={{ display: 'flex',justifyContent: 'flex-end'}}>
                            <h6 className="upload-date">{contentShare?.created_at}</h6>
                            <Button className="chatting-btn">채팅하기</Button>
                            </div>
                        </div>
                    </div>
                </Card.Title>
                <ListGroup className="list-group-flush">
                    <ListGroup.Item></ListGroup.Item>
                    <ListGroup.Item>
                        <div style={{display: 'flex', justifyContent: "space-between", alignItems: 'center'}}>
                        <h4>{contentShare?.title}</h4> 
                        <div className="sharing-views">조회수: {contentShare?.views}</div>
                        </div>
                        <h5 className="sharing-detail-content">
                            {contentShare?.content}
                        </h5>
                        
                    </ListGroup.Item>
                    {/* <ListGroup.Item></ListGroup.Item> */}
                </ListGroup>
                {/* <ListGroup className="list-group-flush">
                    {contentComments.map((comment, index) => (
                        <ListGroup.Item key={index}>{comment.Comment}</ListGroup.Item>
                    ))}
                </ListGroup> */}

                <ListGroup.Item  className="comment-section">
                    <div className="comment-radio">댓글</div>
                    <div className="comment-content">
                        {ContentComments.map((comment, index) => (
                            <div key={comment.id} style={{ marginLeft: '10px'}}>
                                <p className="sharing-comment">{comment.userName}님: {comment.content}</p>
                            </div>
                        ))}
                    </div>
                                        
                <div style={{ display: 'flex'}}>
                <Form.Control type="text" placeholder="댓글을 입력해주세요." className="comment-ready"/> 
                    <FontAwesomeIcon icon={faPaperPlane} style={{color: "#dcdcdc", marginTop: '37px', marginRight: '15rpx', cursor: 'pointer'}} />
                </div>
                </ListGroup.Item>
            </Card.Body>
            <Card.Footer className="text-muted" style={{cursor: 'pointer'}} onClick={()=>{navigate('/board')}}>게시글 목록 보기</Card.Footer>
            </Card>
        </div>
        </>
    )
}

export default BoardDetail;