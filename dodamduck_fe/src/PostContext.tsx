import React, { createContext, useContext, useState, ReactNode } from "react";

// Post 타입 정의
interface Post {
  id: string;
  title: string;
  content: string;
  // 필요한 경우 다른 필드도 추가
}

interface PostContextType {
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
}

// Context 생성
export const PostContext = createContext<PostContextType | undefined>(
  undefined
);

// Provider 컴포넌트 생성
export const PostProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);

  return (
    <PostContext.Provider value={{ posts, setPosts }}>
      {children}
    </PostContext.Provider>
  );
};

// Custom Hook for using PostContext
export const usePost = (): PostContextType => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error("usePost must be used within a PostProvider");
  }
  return context;
};
