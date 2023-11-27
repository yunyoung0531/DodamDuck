import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {React, useContext, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { PostContext } from './PostContext';
import {Button, Card, placeholder} from 'react-bootstrap';
import axios from 'axios';


function Board() {
    let navigate = useNavigate();

    const { posts } = useContext(PostContext);
    const cardItemData = [
        { title: "아이 놀이방", content: "광주에 있는 아이 놀이방. 정말 강추해요!!"},
        { title: "아이 놀이방", content: "놀이방 놀러오세요 !!!"},
        { title: "아이 놀이방", content: "정말 깨끗한 아이 놀이방 발견했습니다"},
        { title: "아이 놀이방", content: "3세 장난감 나눔해요."},
        { title: "아이 놀이방", content: "3세 장난감 나눔해요." }
    ]
    //const allPosts = [...cardItemData, ...posts];


    const [PhpPosts, setPhpPosts] = useState([]);
    
    useEffect(() => {
        // const fetchPosts = async () => {
        //     try {
        //         const response = await axios.get('http://sy2978.dothome.co.kr/ContentShare.php');
        //         setPhpPosts(response.data); // 서버에서 받은 데이터로 상태 업데이트
        //     } catch (error) {
        //         console.error('게시글을 불러오는데 실패함.', error);
        //     }
        // };

        // fetchPosts();
        fetch('http://sy2978.dothome.co.kr/ContentShare.php')
        .then((response) => response.json())
        .then((data) => {
        // 데이터를 상태에 저장합니다.
        console.log("data는? ", data);
        setPhpPosts(data);
        })
        .catch((error) => {
        // 에러가 발생했을 경우 콘솔에 로깅합니다.
        console.error('오류뜸: ', error);
        });
    }, []);
    const allPosts = PhpPosts;

    // const renderPosts = PhpPosts.map((phppost, index) => (
    //     <div className='board-container' key={index} style={{ display: 'flex', alignItems: 'center' }}>
    //         <div className='board-deco'>
    //             <img variant="top" src={phppost.image || "https://static.hyundailivart.co.kr/upload_mall/board/ME00000044/B200025249/B200025249_mnImgPathFile_20210520150319893.jpeg/dims/autorotate/on"} width={'180px'} height={'130px'} style={{borderRadius: '3px'}}/>
    //         </div>
    //         <div className='board-post-content'>
    //             <h4>{phppost.title}</h4>
    //             <p>{phppost.content}</p>
    //         </div>
    //     </div>
    // ));
    const handleCardClick = (postId) => {
        navigate(`/boardDetail/${postId}`);
    }

    

    return(
        <>
        <div className='library-nav'>
            <div className='library-comment1'>
                나눔을 통해 행복을 나누다 
            </div>
            <div className='library-comment2'>
                도담덕 정보 나눔
            </div>
        </div>
        {/* {renderPosts} */}
        {/* <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}> */}
        {allPosts.map((post) => (
            <div className='board-container' key = {post.ShareID}  style={{ display: 'flex', alignItems: 'center' }}>
                <div className='board-deco'>
                    {/* <img variant="top" src={post.images ? post.images[0] : "https://static.hyundailivart.co.kr/upload_mall/board/ME00000044/B200025249/B200025249_mnImgPathFile_20210520150319893.jpeg/dims/autorotate/on"} width={'180px'} height={'130px'} style={{borderRadius: '3px'}}/> */}
                    {/* <img variant="top" src={`http://sy2978.dothome.co.kr/${post.ImageURL}`} /> */}
                    <img variant="top" src={post.ImageURL} onClick={() => handleCardClick(post.ShareID)} width={'180px'} height={'130px'} style={{borderRadius: '3px' , cursor: 'pointer'}} />
                </div>
                <div className='board-post-content' onClick={() => handleCardClick(post.ShareID)}>
                <h4 style={{cursor: 'pointer'}}>{post.Title}</h4>
                <p style={{cursor: 'pointer'}}>{post.Content || post.description}</p>
                </div>
            </div>
        ))}
        {/* </div> */}
        

        <div className='circle' onClick={()=> {navigate('/BoardPost')}}>
            <FontAwesomeIcon icon={faPlus} className='plus-sign' />
        </div>
        </>
    )
}

export default Board;