import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {React, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { PostContext } from './PostContext';
import {Button, Card, placeholder} from 'react-bootstrap';


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
    const allPosts = [...cardItemData, ...posts];

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
        {/* <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}> */}
        {allPosts.map((post, index) => (
            <div className='board-container' style={{ display: 'flex', alignItems: 'center' }}>
                <div className='board-deco'>
                    <img variant="top" src={post.images ? post.images[0] : "https://static.hyundailivart.co.kr/upload_mall/board/ME00000044/B200025249/B200025249_mnImgPathFile_20210520150319893.jpeg/dims/autorotate/on"} width={'180px'} height={'130px'} style={{borderRadius: '3px'}}/>
                

                </div>
                <div className='board-post-content'>
                <h4>{post.title}</h4>
                <p>{post.content || post.description}</p>
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