import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { Container, Card, Button, Form } from "react-bootstrap";
import React, { useState } from "react";


function SharingPost() {

    const [inputValue, setInputValue] = useState("");
    const [tags, setTags] = useState([]);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    }

    const handleKeyPress = (e) => {
        if (e.key === ' ') {
            setTags([...tags, inputValue]);
            setInputValue('');
        }
    }

    const [selectedImages, setSelectedImages] = useState([]);

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
    

    
    return (
        <>
            <div className='sharing-post-comment'>
                교환 & 나눔 글 올리기
            </div>
            <div style={{display: "flex",
                        justifyContent: "center",
                        alignItems: "center"}}>
                <div className="post-container" style={{flexDirection: 'column'}}>
                <div style={{ display: "flex" }}>
                    <div style={{ margin: "20px" }}>상품이미지</div>
                    <Card style={{ width: '10rem', height: "10rem", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f8f8f8", margin: "20px", cursor: "pointer" }}
                        onClick={() => document.getElementById('fileInput').click()}
                    >
                        <FontAwesomeIcon icon={faCamera} style={{ color: "#bbbbbb", fontSize: "30px", fontWeight: "100 !important" }} />
                        <div style={{ color: "#6c6c6c", fontSize: "11px", marginTop: "10px" }}>이미지 추가</div>
                    </Card>
                    {selectedImages.map((image, index) => (
                        <Card key={index} style={{ width: '10rem', height: "10rem", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f8f8f8", margin: "20px", cursor: "pointer" }}
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

                    <div style={{display: "flex"}}>
                        <div style={{margin: "20px"}}>상품명</div>
                        <Form.Control type="text" placeholder="상품명을 등록해주세요" style={{width: '35rem', height: "3rem", display: "flex",justifyContent: "center", alignItems: "center", backgroundColor: "#f8f8f8", margin: "20px", marginLeft: "57px"}}/>
                    </div>
                    <div style={{display: "flex"}}>
                        <div style={{margin: "20px"}}>상품설명</div>
                        <Form.Control as="textarea" placeholder="구매시기, 브랜드/모델명, 제품의 상태 (사용감, 하자 유무) 등을 입력해 주세요.                 서로가 믿고 거래할 수 있도록, 자세한 정보을 올려주세요." style={{width: '38rem', height: "10rem", textAlign: "left", verticalAlign: "top", backgroundColor: "#f8f8f8", margin: "20px", marginLeft: "37px"}}/>
                    </div>
                    <div style={{display: "flex"}}>
                        <div style={{margin: "20px"}}>교환/나눔</div>
                        <Form className='post-radio'>
                            {['radio'].map((type) => (
                                <div key={`inline-${type}`} className="mb-3">
                                <Form.Check
                                    custom
                                    inline
                                    label="교환"
                                    name="group1"
                                    type={type}
                                    id={`inline-${type}-1`}
                                />
                                <Form.Check
                                    custom
                                    inline
                                    label="나눔"
                                    name="group1"
                                    type={type}
                                    id={`inline-${type}-2`}
                                />
                                </div>
                            ))}
                        </Form>
                        </div>
                    <div style={{display: "flex"}}>
                    <div style={{ margin: "20px" }}>해시태그</div>
                        <div style={{ marginLeft: '13px'}}>
                            {tags.map((tag, index) => (
                                <span key={index} style={{ 
                                    backgroundColor: 'white', 
                                    padding: '6px 11px', // 상하좌우 패딩을 다르게 조정
                                    // margin: '3px',
                                    borderRadius: '20px', // 타원 형태를 위한 값 설정
                                    border: '0.7px solid #a9a9a9', 
                                    marginLeft: '20px',
                                    color: '#424242',
                                    fontSize: '17px'
                                                        }}>
                                    #{tag}
                                </span>
                            ))}
                        </div>
                        </div>
                        <div style={{display: "flex"}}>
                        <Form.Control 
                            type="text" 
                            placeholder="태그를 입력하시고 스페이스바를 누르세요" 
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            style={{ width: '30rem', height: "3rem", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f8f8f8", margin: "20px", marginLeft: "150px", marginTop: "-30px" }}
                        />
                        </div>

                        <div style={{display: "flex"}}>
                        <div >
                            <Button variant="outline-dark" className='register-btn'  
                            >등록</Button>
                        </div>
                        </div>                                
                </div>
            </div>
        </>
    )
}

export default SharingPost;