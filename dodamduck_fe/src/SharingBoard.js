import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { PostContext } from './PostContext';
import {Button, Card, placeholder} from 'react-bootstrap';
import SharingDetail from './SharingDetail';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function SharingBoard() {

    let navigate = useNavigate();
    // const { posts } = useContext(PostContext);
    // const cardItemData = [
    //     { title: "딸랑이", content: "3세 장난감 나눔해요.", wishedLocation: "광주광역시", exchangeOrShare: "나눔", tag: "#무료나눔" },
    //     { title: "뽀로로장난감", content: "뽀로로 다른 거랑 교환해요.", wishedLocation: "광주광역시", exchangeOrShare: "교환", tag: "#뽀로로" },
    //     { title: "핑크퐁", content: "핑크퐁 교환합니다.", wishedLocation: "광주광역시", exchangeOrShare: "교환", tag: "#핑크퐁" },
    //     { title: "딸랑이", content: "3세 장난감 나눔해요.", wishedLocation: "광주광역시", exchangeOrShare: "나눔", tag: "#무료나눔" },
    //     { title: "딸랑이", content: "3세 장난감 나눔해요.", wishedLocation: "광주광역시", exchangeOrShare: "나눔", tag: "#무료나눔" }
    // ]

    //const allPosts = [...cardItemData, ...posts];

    const [serverPosts, setServerPosts] = useState([]);
    useEffect(() => {
        fetch('http://sy2978.dothome.co.kr/Post.php')
            .then((response) => response.json())
            .then((data) => {
            console.log("data는? ", data);
            setServerPosts(data);
            })
            .catch((error) => {
            console.error('오류뜸: ', error);
            });
        }, []);

    const allPosts = serverPosts;

    const incrementViewCount = async (postId) => {
        try {
            const postData = new URLSearchParams();
            postData.append('post_id', postId);
            const response = await axios.post('http://sy2978.dothome.co.kr/upload_post_view_up.php', postData);
            console.log("조회수 증가 응답", response.data);

        } catch (error) {
            console.error('조회수 증가 API 호출 실패', error);
        }
    }

    const handleCardClick = (postId) => {
        incrementViewCount(postId); 
        navigate(`/sharingDetail/${postId}`);
    }

    const timeSince = (date) => {
        const postDate = new Date(date);
        const today = new Date();
        const differenceInTime = today.getTime() - postDate.getTime();
        const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
        
        if (differenceInDays === 0) {
        return '오늘';
        } else if (differenceInDays === 1) {
        return '1일 전';
        } else {
        return `${differenceInDays}일 전`;
        }
    }

    return (
        <>
            <div className='library-nav'>
            <div className='library-comment1'>
                나눔을 통해 행복을 나누다 
            </div>
            <div className='library-comment2'>
                교환 & 나눔
            </div>
            </div>
            {/* React JSX */}
            <div className='container'>
                <div className='row' style={{margin: '10px', width: '75rem', display: 'flex', alignItems: 'center'}}>
                    {allPosts.map((post) => (
                        <div className="col-md-3 " key = {post.post_id} onClick={() => handleCardClick(post.post_id)}>
                            <Card className="sharing-card">
                                <div style={{
                                    overflow: 'hidden', 
                                    height: '200px', /* 또는 원하는 높이를 설정하세요 */
                                    }}>
                                    {/* <Card.Img variant="top" src={post.images ? post.images[0] : "https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9788964130193.jpg"}/> */}
                                    {/* <Card.Img variant="top" src={`http://sy2978.dothome.co.kr/${post.image_url}`} /> */}
                                    <div className="sharing-card-image-container" style={{ height: '200px', overflow: 'hidden' }}>
                                        <Card.Img variant="top" src={post.image_url} className="sharing-custom-card-img"/>
                                    </div>

                                </div>
                                <Card.Body className='sharing-card-body'>
                                    <Card.Title className='sharing-card-title'>{post.title}</Card.Title>
                                    <Card.Text className='sharing-card-info'>{post.location}ㆍ{timeSince(post.created_at)}ㆍ조회 {post.views}</Card.Text>
                                    {/* <Card.Text className='sharing-card-content'>{post.content || post.description}</Card.Text> */}
                                    <Card.Text className='sharing-card-content'>{post.category_name}</Card.Text>
                                    {/* <Card.Text>{post.exchangeOrShare}</Card.Text> */}
                                    {/* <Card.Text>{post.wishedLocation}</Card.Text> */}
                                    <Card.Text>
                                        {post.tags && post.tags.map((tag, tagIndex) => (
                                            <span key={tagIndex}>
                                                #{tag}
                                            </span>
                                        ))}
                                        {post.tag && <span>{post.tag}</span>}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>

            <div className='circle' onClick={()=> {navigate('/sharingPost')}}>
                <FontAwesomeIcon icon={faPlus} className='plus-sign' />
            </div>
        </>
    )
}

export default SharingBoard;