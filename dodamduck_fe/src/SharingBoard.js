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

function SharingBoard() {

    let navigate = useNavigate();
    const { posts } = useContext(PostContext);
    const cardItemData = [
        { title: "딸랑이", content: "3세 장난감 나눔해요.", wishedLocation: "광주광역시", exchangeOrShare: "나눔", tag: "#무료나눔" },
        { title: "뽀로로장난감", content: "뽀로로 다른 거랑 교환해요.", wishedLocation: "광주광역시", exchangeOrShare: "교환", tag: "#뽀로로" },
        { title: "핑크퐁", content: "핑크퐁 교환합니다.", wishedLocation: "광주광역시", exchangeOrShare: "교환", tag: "#핑크퐁" },
        { title: "딸랑이", content: "3세 장난감 나눔해요.", wishedLocation: "광주광역시", exchangeOrShare: "나눔", tag: "#무료나눔" },
        { title: "딸랑이", content: "3세 장난감 나눔해요.", wishedLocation: "광주광역시", exchangeOrShare: "나눔", tag: "#무료나눔" }
    ]

    //const allPosts = [...cardItemData, ...posts];

    const [serverPosts, setServerPosts] = useState([]);
    useEffect(() => {
        // 컴포넌트가 마운트되면 서버로부터 데이터를 가져옵니다.
        fetch('http://sy2978.dothome.co.kr/Post.php')
            .then((response) => response.json())
            .then((data) => {
            // 데이터를 상태에 저장합니다.
            console.log("data는? ", data);
            setServerPosts(data);
            })
            .catch((error) => {
            // 에러가 발생했을 경우 콘솔에 로깅합니다.
            console.error('오류뜸: ', error);
            });
        }, []);

    const allPosts = serverPosts;

    const handleCardClick = (postId) => {
        navigate(`/sharingDetail/${postId}`);
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
                                    <Card.Img variant="top" src={'https://media.bunjang.co.kr/product/97455685_1_1689016134_w360.jpg'} />

                                </div>
                                <Card.Body>
                                            <Card.Title>{post.title}</Card.Title>
                                            <Card.Text>{post.content || post.description}</Card.Text>
                                            <Card.Text>{post.exchangeOrShare}</Card.Text>
                                            <Card.Text>{post.wishedLocation}</Card.Text>
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