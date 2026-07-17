'use client';

import { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/common/LoadingState';
import { CommentSection } from '@/components/common/CommentSection';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import {
  useBoardDetail,
  useDeleteBoardPost,
  useDeleteBoardComment,
  useAddBoardComment,
  useIncrementBoardViewCount,
} from '@/services/board/useBoard';
import { useUser } from '@/services/auth/useUser';
import { formatDateTime } from '@/libs/format-date';

export default function BoardDetailContents() {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);
  const router = useRouter();
  const { user } = useUser();
  const hasIncremented = useRef(false);

  const { data, isLoading } = useBoardDetail(postId);
  const deleteMutation = useDeleteBoardPost();
  const deleteCommentMutation = useDeleteBoardComment(postId);
  const commentMutation = useAddBoardComment();
  const incrementView = useIncrementBoardViewCount();

  useEffect(() => {
    if (!hasIncremented.current) {
      hasIncremented.current = true;
      incrementView.mutate(postId);
    }
  }, [postId]);

  if (isLoading) {
    return <LoadingState height="lg" />;
  }

  if (!data) {
    return (
      <div className="flex justify-center pt-10">
      <Alert variant="destructive" className="max-w-md">
        <AlertDescription>게시글을 찾을 수 없습니다.</AlertDescription>
      </Alert>
      </div>
    );
  }

  const { post, comments } = data;
  const isAuthor = user?.id === post.user_id;

  function handleDelete() {
    if (!user) return;
    deleteMutation.mutate(postId, {
      onSuccess: () => router.push('/board'),
    });
  }

  function handleComment(content: string) {
    if (!user) return;
    commentMutation.mutate({ postId, content });
  }

  return (
    <div className="flex justify-center px-4 py-10">
      <div className="w-full max-w-4xl">
      <Card>
        <CardHeader className="border-b border-gray-200 p-4">
          <p className="font-semibold">도담덕 정보 나눔 게시판</p>
        </CardHeader>

        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="flex flex-col gap-4 md:w-1/2">
              <div className="relative aspect-square overflow-hidden rounded-md">
                <Image
                  src={post.image_url || '/images/도담덕로고.png'}
                  alt={post.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.profiles.profile_url || undefined} />
                  <AvatarFallback>
                    {post.profiles.display_name?.[0] ?? '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-0.5">
                  <p className="font-semibold">{post.profiles.display_name} 님</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(post.created_at)}</p>
                </div>
              </div>
            </div>

            <Separator orientation="vertical" className="hidden md:block" />

            <div className="flex flex-1 flex-col gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-xl font-bold">{post.title}</h3>
                  {isAuthor && (
                    <ConfirmDialog
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 size={18} />
                        </Button>
                      }
                      title="게시글 삭제"
                      description="이 게시글을 삭제하시겠습니까? 삭제된 게시글은 복구할 수 없습니다."
                      onConfirm={handleDelete}
                      isLoading={deleteMutation.isPending}
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  조회 {post.views}
                </p>
              </div>

              <p className="whitespace-pre-wrap">{post.content}</p>

              <div className="py-2">
                <Separator />
              </div>

              <CommentSection
                comments={comments}
                isLoggedIn={!!user}
                onSubmit={handleComment}
                isSubmitting={commentMutation.isPending}
                onDelete={(commentId) => deleteCommentMutation.mutate({ commentId, userId: user!.id })}
                currentUserId={user?.id}
                isDeletingId={
                  deleteCommentMutation.isPending
                    ? (deleteCommentMutation.variables?.commentId ?? null)
                    : null
                }
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t border-gray-200 p-4">
          <Link
            href="/board"
            className="text-sm text-muted-foreground hover:underline"
          >
            게시글 목록보기
          </Link>
        </CardFooter>
      </Card>
      </div>
    </div>
  );
}
