import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDateTime } from '@/libs/format-date';

export interface PostAuthorProps {
  /** 작성자 표시 이름. 없으면 물음표를 보여줍니다. */
  displayName: string | null;
  /** 작성자 프로필 이미지 주소 */
  profileUrl: string | null;
  /** 작성 시각. 절대 시각으로 보여줍니다. */
  createdAt: string;
  /** 이름과 시각 사이에 끼워 넣을 줄. 교환/나눔은 거래 희망 장소를 넣습니다. */
  detail?: string | null;
}

/**
 * @description 게시글 작성자의 프로필, 이름, 작성 시각을 한 줄로 보여줍니다.
 *
 * @public
 * @name PostAuthor
 * @tag div
 */
export function PostAuthor({
  displayName,
  profileUrl,
  createdAt,
  detail,
}: PostAuthorProps) {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-12 w-12">
        <AvatarImage src={profileUrl || undefined} />
        <AvatarFallback>{displayName?.[0] ?? '?'}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-0.5">
        <p className="font-semibold">{displayName} 님</p>
        {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
        <p className="text-xs text-muted-foreground">
          {formatDateTime(createdAt)}
        </p>
      </div>
    </div>
  );
}
