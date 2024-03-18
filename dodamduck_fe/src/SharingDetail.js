import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, ListGroup, Form } from "react-bootstrap";
import axios from 'axios';
import {React, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { faPen } from '@fortawesome/free-solid-svg-icons';
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

    //댓글 달기
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

    // 작업 중 입니다 🙏
    const deletePost = async () => {
        console.log(`post_id는? ${id}, user_id는?? ${user.userID}`);
        try {
            const response = await axios.delete(`http://sy2978.dothome.co.kr/PostDelete.php`, {
                params: {
                    post_id: id, 
                    user_id: user.userID
                }
            });
    
            console.log('Response from server:', response.data);
            if (response.data.error === false) {
                console.log('게시물이 성공적으로 삭제되었습니다.');
                navigate('/sharingBoard');
            } else {
                console.error('게시물 삭제에 실패했습니다.', response.data.message);
            }
        } catch (error) {
            console.error('게시물을 삭제하는 동안 오류가 발생했습니다.', error.response || error);
        }
    };
    

    const createChatRoom = async () => {
        console.log('채팅방 생성 함수 호출됨');
        try {
            const formData = new FormData();
            formData.append('post_id', id); 
            formData.append('user_id', user.userID);
        
            console.log('API 호출 전');
            const response = await axios.post('http://sy2978.dothome.co.kr/create_chat_room.php', formData);
            console.log('API 호출 후');
        
            if (response.data.error === false) {
                console.log('채팅방이 성공적으로 생성되었습니다.', response.data);
                // navigate(`/chattingDetail/${user.chat_id}/${user.partnerID}/${user.partnerName}/${user.userID}`);
            } else {
                console.error('채팅방 생성에 실패했습니다.', response.data.message);
            }
        } catch (error) {
            console.error('채팅방을 생성하는 동안 오류가 발생했습니다.', error);
        }
        }; 

    if (!postDetail || !postDetail.post || postDetail.post.length === 0) {
        return <div>로딩중입니다.</div>
    }
    const { title, content, views, location, userName, image_url, created_at, profile_url } = postDetail.post;

    return (
        <div className="shring-detail-card">
            <Card className="text-center">
                <Card.Header>교환 & 나눔 게시판</Card.Header>
                    <Card.Body>
                    <Card.Img variant="top" src={image_url} width={'100px'} height={'460px'} />
                    <Card.Title style={{marginTop: '20px'}}>
                        <div style={{display: 'flex', marginLeft: '15px', justifyContent: 'space-between', alignItems: 'center'}}>
                            <div style={{display: 'flex'}}>
                            <img src={profile_url ? profile_url : 'https://www.lab2050.org/common/img/default_profile.png'} width={'65px'} height={'65px'} style={{borderRadius: '50%'}}/>
                            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                                <h5 style={{display: 'flex', marginLeft: '15px'}}>{userName}님</h5>
                                <div style={{display: 'flex'}}>
                                <h6 className="upload-date">{location}</h6>
                                <p className="sharing-comment-created" style={{marginTop: '3px', marginLeft: '8px'}}>{created_at}</p>
                                </div>
                            </div>
                            </div>
                            <Button className="sharing-chatting-btn" onClick={()=>{
                                createChatRoom();
                                console.log('채팅하기 버튼 클릭');
                                navigate('/chatting') // 채팅 상세로 페이지 리다이렉트 필요1!!!
                            }}>채팅하기</Button>
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
                                <div className="sharing-delete">
                                    
                                    {
                                        user && postDetail && user.userName === postDetail.post.userName &&
                                        <>
                                        <FontAwesomeIcon icon={faPen} style={{color: "#4d4d4d", marginRight: '7px', cursor: 'pointer'}} />
                                        <FontAwesomeIcon 
                                            icon={faTrashCan} 
                                            style={{color: "#4d4d4d", cursor: 'pointer'}} 
                                            onClick={deletePost}
                                        />
                                        </>
                                    }

                                </div>
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
    )
}

export default SharingDetail;