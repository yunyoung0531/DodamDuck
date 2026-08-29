'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EditProfileDialog } from '@/components/my-shop/EditProfileDialog';
import { MyProductsTab } from './MyProductsTab';
import { MyWishlistTab } from './MyWishlistTab';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/services/auth/auth.types';

interface MyShopContentsProps {
  user: User;
  profile: Profile;
}

export default function MyShopContents({ user, profile }: MyShopContentsProps) {
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
          <TabsTrigger value="products" className="cursor-pointer">상품</TabsTrigger>
          <TabsTrigger value="wishlist" className="cursor-pointer">하트 목록</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="pt-6">
          <MyProductsTab userId={user.id} />
        </TabsContent>

        <TabsContent value="wishlist" className="pt-6">
          <MyWishlistTab />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
