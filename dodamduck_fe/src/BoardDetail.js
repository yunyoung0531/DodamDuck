import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, ListGroup, Form } from "react-bootstrap";
import axios from 'axios';
import {React, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from './AuthContext';

function BoardDetail() {
    let { id } = useParams();
    const { user } = useAuth();
    let navigate = useNavigate();
    

    const [contentShare, setContentShare] = useState(null);
    const [ContentComments, setContentComments] = useState([]); 

    const [comment, setComment] = useState(""); 

    const handleCommentChange = (e) => {
        setComment(e.target.value);
    };

    const submitComment = async () => {
        const existingToken = localStorage.getItem('token');
        if (existingToken) {
            try {
                const formData = new FormData();
                formData.append('share_id', id);
                formData.append('user_id', user.userID);
                formData.append('comment', comment);
        
                const response = await axios.post('http://sy2978.dothome.co.kr/upload_share_comment.php', formData, {
                    headers: { "Authorization": `Bearer ${existingToken}` }
                });
                if (response.status === 200 && response.data.error === false) {
                    console.log('댓글이 성공적으로 등록되었습니다.', response.data);
                    console.log('response.data.userID? ', response.data.comment_id);
                    const newComment = {
                        id: response.data.comment_id, 
                        userName: user.userName, 
                        content: comment,
                        created_at:  response.data.created_at
                    };
                    
                    setContentComments(prevComments => [newComment, ...prevComments]);
                    setComment("");
                } else {
                    console.error('댓글 등록에 실패했습니다.');
                }
            } catch (error) {
                console.error('댓글을 등록하는 동안 오류가 발생했습니다.', error);
            }
        }
    };
    

    useEffect(() => {
        const fetchDetail = async () => {
            const existingToken = localStorage.getItem('token');
            if (existingToken) {
                try {
                    const headers = {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${existingToken}`
                    };
                    const response = await axios.get(`http://sy2978.dothome.co.kr/ContentShare_Detail.php?share_id=${id}`, { headers });
                    const sortedComments = Array.isArray(response.data.comments) 
                    ? response.data.comments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                    : [];
                    if (response.status === 200 && response.data) {
                        setContentShare(response.data.post);
                        setContentComments(sortedComments);
                        console.log(id);
                        console.log(response.data);
                    }
                } catch (error) {
                    console.error('실패함', error);
                }
            }
    };

    fetchDetail();
    }, [user, id]); 

    // 게시글 삭제
    const deletePost = async () => {
        console.log(`share_id는? ${id}, user_id는?? ${user.userID}`);
        const existingToken = localStorage.getItem('token');
        if (existingToken) {
            try {
                const response = await axios.delete(`http://sy2978.dothome.co.kr/ShareContentDelete.php`, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        "Authorization": `Bearer ${existingToken}`
                    },
                    data: new URLSearchParams({
                        share_id: id,
                        user_id: user.userID
                    }).toString()
                });
    
                console.log('Response from server:', response.data);
                if (response.status === 200 && response.data.error === "false") {
                    console.log('게시물이 성공적으로 삭제되었습니다.');
                    navigate('/board');
                } else {
                    console.error('게시물 삭제에 실패했습니다.', response.data.message);
                }
            } catch (error) {
                console.error('게시물을 삭제하는 동안 오류가 발생했습니다.', error.response || error);
            }
        }
    };

    
    if (!contentShare) {
        return <div>로딩중...</div>;
    }

    return (
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
                            <h5 style={{ marginLeft: '-30%'}}>{contentShare?.userName}님</h5>
                            <div style={{ display: 'flex',justifyContent: 'flex-end'}}>
                            <h6 className="upload-date">{contentShare?.created_at}</h6>
                            </div>
                        </div>
                        {/* <Button className="chatting-btn">채팅하기</Button> */}
                        { user && user.userName !== contentShare.userName &&
                            <Button className="chatting-btn">채팅하기</Button> 
                        }
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
                            <div className="sharing-delete">
                            {
                                user && user.userName === contentShare.userName &&
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
                    <ListGroup.Item></ListGroup.Item>
                </ListGroup>

                <ListGroup.Item  className="comment-section">
                    <div className="comment-radio">댓글</div>
                    <div className="comment-content">
                        {ContentComments.map((comment, index) => (
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
                { user && 
                    <div style={{ display: 'flex'}}>
                    <Form.Control type="text" placeholder="댓글을 입력해주세요." className="comment-ready"
                    value={comment}
                    onChange={handleCommentChange}/> 
                        <FontAwesomeIcon icon={faPaperPlane} style={{color: "#dcdcdc", marginTop: '37px', marginRight: '15rpx', cursor: 'pointer'}} 
                        onClick={submitComment} 
                        />
                    </div>
                }
                </ListGroup.Item>
            </Card.Body>
            <Card.Footer className="text-muted" style={{cursor: 'pointer'}} onClick={()=>{navigate('/board')}}>게시글 목록 보기</Card.Footer>
            </Card>
        </div>
    )
}

export default BoardDetail;