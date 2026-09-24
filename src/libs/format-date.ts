const DAYS_PER_MONTH = 30;
const DAYS_PER_YEAR = 365;

/**
 * @description 경과 시간을 상대 표현으로 바꿉니다.
 *
 * @remarks
 * 방금 전, N분 전, N시간 전, N일 전, N개월 전 순으로 넘어가고 1년이 지나면
 * `formatDate`의 절대 날짜를 돌려줍니다. 호출 시점의 현재 시각으로 계산하므로
 * 화면에 오래 띄워 두려면 호출부가 주기적으로 리렌더해야 합니다.
 * @param dateString 기준 시각. `Date`가 파싱할 수 있는 문자열
 * @returns 사람이 읽는 경과 표현
 * @see useNow 상대 시간 라벨을 주기적으로 갱신할 때 함께 씁니다
 * @public
 */
export function formatTimeSince(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < DAYS_PER_MONTH) return `${diffDays}일 전`;
  if (diffDays < DAYS_PER_YEAR) {
    return `${Math.floor(diffDays / DAYS_PER_MONTH)}개월 전`;
  }

  return formatDate(dateString);
}

/**
 * @description 채팅 날짜 구분선 라벨을 만듭니다.
 *
 * @remarks
 * 오늘과 어제는 말로, 올해 안이면 `9월 21일`, 그 전이면 `2025년 3월 11일`로 돌려줍니다.
 * @param dateString 기준 시각. `Date`가 파싱할 수 있는 문자열
 * @returns 구분선에 넣을 라벨
 * @public
 */
export function formatDateDivider(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today)) return '오늘';
  if (isSameDay(date, yesterday)) return '어제';

  const month = date.getMonth() + 1;
  const day = date.getDate();

  if (date.getFullYear() === today.getFullYear()) {
    return `${month}월 ${day}일`;
  }

  return `${date.getFullYear()}년 ${month}월 ${day}일`;
}

/**
 * 두 시각이 로컬 기준으로 같은 날인지 판별합니다.
 *
 * @param a 비교할 시각
 * @param b 비교할 시각
 * @returns 연, 월, 일이 모두 같으면 `true`
 * @public
 */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * @description 두 시각이 로컬 기준으로 같은 분인지 판별합니다.
 *
 * @remarks
 * 날짜까지 함께 봅니다. 어제 10시 30분과 오늘 10시 30분은 같은 분이 아닙니다.
 * @param a 비교할 시각
 * @param b 비교할 시각
 * @returns 같은 날의 같은 시각, 같은 분이면 `true`
 * @see buildMessageRows 연속 메시지를 묶을 때 이 함수를 씁니다
 * @public
 */
export function isSameMinute(a: Date, b: Date): boolean {
  return (
    isSameDay(a, b) &&
    a.getHours() === b.getHours() &&
    a.getMinutes() === b.getMinutes()
  );
}

/**
 * 시각을 `2026.09.24` 형식으로 바꿉니다.
 *
 * @param dateString 기준 시각. `Date`가 파싱할 수 있는 문자열
 * @returns 점으로 구분한 연월일
 * @public
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
}

/**
 * 시각을 `2026.09.24 14:32` 형식으로 바꿉니다.
 *
 * @param dateString 기준 시각. `Date`가 파싱할 수 있는 문자열
 * @returns 점으로 구분한 연월일과 24시간제 시각
 * @public
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}.${month}.${day} ${hours}:${minutes}`;
}
