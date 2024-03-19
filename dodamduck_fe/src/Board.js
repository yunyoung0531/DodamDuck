import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {React, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext';

function Board() {
    const { user } = useAuth();
    let navigate = useNavigate();

    const [PhpPosts, setPhpPosts] = useState([]);
    
    useEffect(() => {
        fetch('http://sy2978.dothome.co.kr/ContentShare.php')
        .then((response) => response.json())
        .then((data) => {
        console.log("data는? ", data);
        setPhpPosts(data);
        })
        .catch((error) => {
        console.error('오류뜸: ', error);
        });
    }, []);
    const allPosts = PhpPosts;

    const incrementViewCount = async (ShareID) => {
        try {
            const postData = new URLSearchParams();
            postData.append('share_id', ShareID);
            const response = await axios.post('http://sy2978.dothome.co.kr/content_share_view_up.php', postData);
            console.log("조회수 증가 응답", response.data);

        } catch (error) {
            console.error('조회수 증가 API 호출 실패', error);
        }
    }
    const handleCardClick = (ShareID) => {
        incrementViewCount(ShareID); 
        navigate(`/boardDetail/${ShareID}`);
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
            {allPosts.map((post) => (
                <div className='board-container' key = {post.ShareID}  onClick={() => handleCardClick(post.ShareID)} style={{ display: 'flex', alignItems: 'center' }}>
                    <div className='board-deco'>
                        <img variant="top" src={post.ImageURL}  width={'180px'} height={'130px'} style={{borderRadius: '3px' , cursor: 'pointer'}} />
                    </div>
                    <div className='board-post-content' >
                        <h4 style={{cursor: 'pointer'}}>{post.Title}</h4>
                        <p className='sharing-card-info'>댓글 {post.CommentCount}개 ㆍ{timeSince(post.CreatedAt)}ㆍ조회 {post.Views}</p>
                        <p style={{cursor: 'pointer'}}>{post.Content || post.description}</p>
                    </div>
                </div>
            ))}
            { user && 
                <div className='circle' onClick={()=> {navigate('/BoardPost')}}>
                    <FontAwesomeIcon icon={faPlus} className='plus-sign' />
                </div>
            }
        </>
    )
}

export default Board;