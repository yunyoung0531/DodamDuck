import { useParams } from "react-router-dom";

function SharingDetail() {

    let {id} = useParams();
    return (
        <>
        Post ID: {id}
        </>
    )
}

export default SharingDetail;