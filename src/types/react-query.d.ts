import '@tanstack/react-query';

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      /** 실패 토스트의 제목. 없으면 공통 제목을 씁니다. */
      errorTitle?: string;
      /** 실패를 토스트로 알리지 않습니다. `isError`와 `error`는 그대로 남습니다. */
      silent?: boolean;
    };
  }
}
