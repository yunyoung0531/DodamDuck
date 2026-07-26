'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { EditProfileDialog } from '@/components/my-shop/EditProfileDialog';
import { LikeButton } from '@/components/common/LikeButton';
import { useSharingList, useIncrementSharingViewCount } from '@/services/sharing/useSharing';
import { useUserLikedSharingPosts } from '@/services/likes/useLikes';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/services/auth/auth.types';

interface MyShopContentsProps {
  user: User;
  profile: Profile;
}

export default function MyShopContents({ user, profile }: MyShopContentsProps) {
  const router = useRouter();
  const { data: allPosts, isLoading } = useSharingList();
  const incrementView = useIncrementSharingViewCount();
  const { data: likedSharingPosts, isLoading: isLoadingLikedSharing } =
    useUserLikedSharingPosts();

  const myPosts = allPosts?.filter((post) => post.user_id === user.id);

  function handleProductClick(postId: number) {
    incrementView.mutate(postId);
    router.push(`/sharing/${postId}`);
  }

  return (
    <div className="flex justify-center px-4 py-10">
      <div className="flex w-full max-w-4xl flex-col gap-8">
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <Avatar className="h-30 w-30">
            <AvatarImage src={profile.profile_url || undefined} />
            <AvatarFallback className="text-2xl">
              {profile.display_name?.[0] ?? '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col gap-1">
            <h3 className="font-heading text-xl font-bold">
              {profile.display_name}({profile.username}) 님
            </h3>
            <Badge variant="secondary" className="w-fit">
              level.{profile.level}
            </Badge>
            <p className="text-sm text-muted-foreground">
              인증 횟수: {profile.verification_count}
            </p>
            <p className="text-sm text-muted-foreground">
              위치: {profile.location}
            </p>
          </div>
          <div className="flex items-start">
            <EditProfileDialog profile={profile} />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">상품</TabsTrigger>
          <TabsTrigger value="wishlist">하트목록</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="pt-6">
          {isLoading && <LoadingState height="sm" />}

          {myPosts && myPosts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {myPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex cursor-pointer flex-col gap-2"
                  onClick={() => handleProductClick(post.id)}
                >
                  <div className="relative aspect-square overflow-hidden rounded-md">
                    <Image
                      src={post.image_url || '/images/도담덕로고.png'}
                      alt={post.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <p className="truncate text-sm">{post.title}</p>
                </div>
              ))}
            </div>
          ) : (
            !isLoading && (
              <EmptyState message="등록한 상품이 없습니다." className="py-8" />
            )
          )}
        </TabsContent>

        <TabsContent value="wishlist" className="pt-6">
          {isLoadingLikedSharing && <LoadingState height="sm" />}

          {likedSharingPosts && likedSharingPosts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {likedSharingPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex cursor-pointer flex-col gap-2"
                  onClick={() => {
                    incrementView.mutate(post.id);
                    router.push(`/sharing/${post.id}`);
                  }}
                >
                  <div className="relative aspect-square overflow-hidden rounded-md">
                    <Image
                      src={post.image_url || '/images/도담덕로고.png'}
                      alt={post.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm">{post.title}</p>
                    <LikeButton
                      postId={post.id}
                      likeCount={post.like_count}
                      size="sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !isLoadingLikedSharing && (
              <EmptyState message="좋아요한 게시글이 없습니다." className="py-8" />
            )
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
