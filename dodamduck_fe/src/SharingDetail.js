import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Button, Card, ListGroup, Form } from "react-bootstrap";
import axios from 'axios';
import {React, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from './AuthContext';

function SharingDetail() {

    const { user } = useAuth();

    let { id } = useParams();
    const [postDetail, setPostDetail] = useState(null);
    let navigate = useNavigate();
    const [comment, setComment] = useState(""); 

    const handleCommentChange = (e) => {
        setComment(e.target.value);
    };

    const submitComment = async () => {
        try {
            const formData = new FormData();
            formData.append('post_id', id);
            formData.append('user_id', user.userID);
            formData.append('content', comment);
    
            const response = await axios.post('http://sy2978.dothome.co.kr/upload_comments.php', formData);
    
            if (response.data.error === false) {
                console.log('댓글이 성공적으로 등록되었습니다.', response.data);
                console.log('response.data.userID? ', response.data.comment_id)

                const newComment = {
                    id: response.data.comment_id, 
                    userName: user.userName, 
                    content: comment, 
                    created_at: created_at
                };
                
                setPostDetail(prevDetail => ({
                    ...prevDetail,
                    comments: [...prevDetail.comments, newComment]
                }));
                setComment(""); 
            } else {
                console.error('댓글 등록에 실패했습니다.');
            }
        } catch (error) {
            console.error('댓글을 등록하는 동안 오류가 발생했습니다.', error);
        }
    };
    
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
    const { title, content, views, location, userName, image_url, created_at, profile_url, user_id } = postDetail.post;

    return (
        <>
        <div className="shring-detail-card">
            <Card className="text-center">
            <Card.Header>교환 & 나눔 게시판

            </Card.Header>
            <Card.Body>
            <Card.Img variant="top" src={image_url} width={'100px'} height={'460px'} />
                <Card.Title style={{marginTop: '20px'}}>
                    <div style={{display: 'flex', marginLeft: '15px'}}>
                        <img src={profile_url ? profile_url : 'https://www.lab2050.org/common/img/default_profile.png'} width={'65px'} height={'65px'} style={{borderRadius: '50%'}}/>
                        <div style={{display: 'flex', flexDirection: 'column'}}>
                            {/* <div style={{display: 'flex'}}> */}
                            <h5 style={{marginLeft: '-500px'}}>{user_id}님</h5>
                            {/* </div> */}
                            {/* <div style={{display: 'flex'}}> */}
                            <div style={{ display: 'flex',justifyContent: 'flex-end'}}>
                            <div style={{display: 'flex'}}>
                                <h6 className="upload-date">{location}</h6>
                                <p className="sharing-comment-created" style={{marginTop: '3px'}}>{created_at}</p>
                            </div>
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
                                <>
                                <div className="sharing-comment-style">
                                    <p className="sharing-comment">{comment.userName}님</p>
                                    <p className="sharing-comment-created">{comment.created_at}</p>
                                </div>
                                <div key={comment.id} style={{ marginLeft: '10px'}}>
                                    <p className="sharing-comment-content">{comment.content}</p>
                                </div>
                                </>
                            ))}
                        </div>
                                            
                    <div style={{ display: 'flex'}}>
                    <Form.Control type="text" placeholder="댓글을 입력해주세요." className="comment-ready"
                    value={comment}
                    onChange={handleCommentChange}
                    /> 
                        <FontAwesomeIcon icon={faPaperPlane} style={{color: "#dcdcdc", marginTop: '37px', marginLeft: '10px', cursor: 'pointer'}} 
                        onClick={submitComment} 
                        />
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