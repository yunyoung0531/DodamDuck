import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { Container, Card, Button, Form } from "react-bootstrap";
import React, { useState, useContext } from "react";
import { PostContext } from './PostContext';
import { useNavigate } from 'react-router';

function BoardPost() {
    
    let navigate = useNavigate();

    const [inputValue, setInputValue] = useState("");
    const [tags, setTags] = useState([]);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    }



    const [selectedImages, setSelectedImages] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");


    const handleImageChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
    
        reader.onloadend = () => {
            setSelectedImages([...selectedImages, reader.result]);
        };
    
        if (file) {
            reader.readAsDataURL(file);
        }
    }

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
    }
    
    const handleDescriptionChange = (e) => {
        setDescription(e.target.value);
    }
    

    const { setPosts } = useContext(PostContext);

    const handlePostSubmit = () => {
        // formData는 사용자가 입력한 데이터를 나타냅니다.
        const formData = {
            images: selectedImages,
            title: title,
            description: description,
        };

        setPosts(prevPosts => [...prevPosts, formData]);
    }

    
    return (
        <>
            <div className='sharing-post-comment'>
                도담덕 게시판 글 올리기 🖤
            </div>
            <div style={{display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        }}>
                <div className="post-container" style={{flexDirection: 'column', color: ''}}>
                    <Form.Control className='post-title-container' type="text" placeholder="ㅤ글 제목" onChange={handleTitleChange}></Form.Control>
                {/* <hr className='post-title-container'/> */}
                <div style={{ display: "flex" }}>
                    <Card style={{ width: '10rem', height: "10rem", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f8f8f8", margin: "13px", cursor: "pointer", marginLeft:'18px' }}
                        onClick={() => document.getElementById('fileInput').click()}
                    >
                        <FontAwesomeIcon icon={faCamera} style={{ color: "#bbbbbb", fontSize: "30px", fontWeight: "100 !important" }} />
                        <div style={{ color: "#6c6c6c", fontSize: "11px", marginTop: "10px" }}>이미지 추가</div>
                    </Card>
                    {selectedImages.map((image, index) => (
                        <Card key={index} style={{ width: '10rem', height: "10rem", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f8f8f8", margin: "13px", cursor: "pointer" }}
                            onClick={() => document.getElementById('fileInput').click()}
                        >
                            <img src={image} alt={`Selected ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover',borderRadius: '3%' }} />
                        </Card>
                    ))}
                    
                    <input 
                        type="file"
                        id="fileInput"
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                        accept="image/*"  // 이미지만 선택할 수 있도록 설정
                    />
                </div>
                    <div style={{display: "flex"}} >
                        <Form.Control as="textarea" placeholder=" 도담덕 게시판은 누구나 기분 좋게 참여할 수 있는 커뮤니티를 만들기 위해 커뮤니티 이용규칙을 제정하여 운영하고 있습니다. 
                        위반 시 게시물이 삭제되고 서비스 이용이 일정 기간 제한될 수 있습니다. 
                        
                        아래는 이 게시판에 해당하는 핵심 내용에 대한 요약 사항이며, 게시물 작성 전 커뮤니티 이용규칙 전문을 반드시 확인하시기 바랍니다. 
                        ※ 정치·사회 관련 행위 금지 
                        - 국가기관, 정치 관련 단체, 언론, 시민단체에 대한 언급 혹은 이와 관련한 행위 
                        - 정책·외교 또는 정치·정파에 대한 의견, 주장 및 이념, 가치관을 드러내는 행위 
                        - 성별, 종교, 인종, 출신, 지역, 직업, 이념 등 사회적 이슈에 대한 언급 혹은 이와 관련한 행위 
                        - 위와 같은 내용으로 유추될 수 있는 비유, 은어 사용 행위 
                        * 해당 게시물은 시사·이슈 게시판에만 작성 가능합니다.
                        
                        ※ 홍보 및 판매 관련 행위 금지 
                        - 영리 여부와 관계 없이 사업체·기관·단체·개인에게 직간접적으로 영향을 줄 수 있는 게시물 작성 행위 
                        - 위와 관련된 것으로 의심되거나 예상될 수 있는 바이럴 홍보 및 명칭·단어 언급 행위 
                        " 
                        onChange={handleDescriptionChange}
                        style={{width: '62rem', height: "20rem", textAlign: "left", verticalAlign: "top", backgroundColor: "#f8f8f8", margin: "20px", marginLeft: "17px", marginTop: '20px', color: '#000000'}}
                        className='board-textarea'
                        />
                    </div>
                        <div style={{display: "flex"}}>
                        <div >
                            <Button variant="outline-dark" className='board-register-btn' onClick={()=> {handlePostSubmit(); navigate('/Board')}}
                            >등록</Button>
                        </div>
                        </div>                                
                </div>
            </div>
        </>
    )
}

export default BoardPost;