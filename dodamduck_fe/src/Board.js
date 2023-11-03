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

        <div className='board-container'>
            <div className='board-deco'>

            </div>
        </div>

        <div className='circle' onClick={()=> {navigate('/BoardPost')}}>
            <FontAwesomeIcon icon={faPlus} className='plus-sign' />
        </div>
        </>
    )
}

export default Board;