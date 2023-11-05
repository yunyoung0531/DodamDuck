import {Tab, Tabs} from 'react-bootstrap';


function MyShop() {
    return (
        <>
        <div className="myshop-container " style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{margin: '40px'}}>
                <img src="https://i1.sndcdn.com/avatars-000773808259-oqqdgp-t240x240.jpg" width={'140px'} height={'140px'} style={{borderRadius: '50%'}}/>
            </div>
            <div style={{display: 'flex', justifyContent: 'center'}}>
                <h5 style={{marginRight: '15px'}}>닉네임</h5>
                <p className="myshop-level">레벨</p>
            </div>
        </div>
        <div style={{ maxWidth: '1108px', margin: 'auto' }}>
            <Tabs
            defaultActiveKey="home"
            id="uncontrolled-tab-example"
            className="mb-3"
            >
            <Tab eventKey="home" title="상품">
                <div style={{display: 'flex'}}>
                    <div style={{margin: '20px' }}>
                        <img src='https://img1.tmon.kr/cdn3/deals/2019/06/20/2187486298/front_07afa_gxvub.jpg' width={'140px'} height={'140px'} style={{borderRadius: '5%'}}/>
                        <h6 style={{display: 'flex', textAlign:'center'}}>뽀로로 오뚜기</h6>
                    </div>
                    <div style={{margin: '20px'}}>
                        <img src='https://cdn.011st.com/11dims/resize/600x600/quality/75/11src/product/4957671460/B.jpg?751000000' width={'140px'} height={'140px'} style={{borderRadius: '5%'}}/>
                        <h6 style={{display: 'flex', textAlign:'center'}}>포로리 인형</h6>
                    </div>
                </div>
            </Tab>
            <Tab eventKey="profile" title="하트목록">
                내가 하트 누른거 나옴
            </Tab>
            </Tabs>
        </div>
        </>
    )
}

export default MyShop;