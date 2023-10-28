import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

function SharingBoard() {

    let navigate = useNavigate();
    
    return (
        <>
            <div className='library-nav'>
            <div className='library-comment1'>
                나눔을 통해 행복을 나누다 
            </div>
            <div className='library-comment2'>
                교환&나눔
            </div>
            </div>

            <div className='circle' onClick={()=> {navigate('/sharingPost')}}>
                <FontAwesomeIcon icon={faPlus} className='plus-sign' />
            </div>
        </>
    )
}

export default SharingBoard;