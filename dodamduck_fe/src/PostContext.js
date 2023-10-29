import React, { createContext, useContext, useState } from "react";

// Context 생성
export const PostContext = createContext();

// Provider 컴포넌트 생성
export const PostProvider = ({ children }) => {
    const [posts, setPosts] = useState([]);

    return (
    <PostContext.Provider value={{ posts, setPosts }}>
        {children}
    </PostContext.Provider>
    );
};
