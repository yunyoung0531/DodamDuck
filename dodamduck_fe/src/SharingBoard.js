import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {React, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { PostContext } from './PostContext';


function SharingBoard() {

    let navigate = useNavigate();
    const { posts } = useContext(PostContext);
    
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

            <div className='circle' onClick={()=> {navigate('/sharingPost')}}>
                <FontAwesomeIcon icon={faPlus} className='plus-sign' />
            </div>
            <div style={{margin: '100px'}}>
            {posts.map((post, index) => (
                // <div key={post.id}>
                <div key={index}>
                    <img src={post.images[0]} width={'100px'} height={'100px'} />
                    <h2>{post.title}</h2>
                    <p>{post.description}</p>
                    <p>{post.exchangeOrShare}</p>
                    <div>
                        {post.tags && post.tags.map((tag, tagIndex) => (
                            <span key={tagIndex}>
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            ))}
            </div>
            <div className='circle' onClick={()=> {navigate('/sharingPost')}}>
                <FontAwesomeIcon icon={faPlus} className='plus-sign' />
            </div>
        </>
    )
}

export default SharingBoard;