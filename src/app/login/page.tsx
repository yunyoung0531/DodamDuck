'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingButton } from '@/components/common/LoadingButton';
import { PasswordInput } from '@/components/common/PasswordInput';
import { LoadingState } from '@/components/common/LoadingState';
import { FormFieldError } from '@/components/common/FormFieldError';
import { loginSchema, type LoginForm } from '@/libs/validations/auth';
import { servSignIn } from '@/services/auth/auth-services';

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingState height="full" />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/';
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userID: '',
      userPassword: '',
    },
  });

  async function onSubmit(values: LoginForm) {
    setError('');
    setIsLoading(true);

    try {
      await servSignIn({
        userID: values.userID,
        userPassword: values.userPassword,
      });

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError('아이디 또는 비밀번호가 일치하지 않습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-dodam-light">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-6 p-8">
          <Image
            src="/images/도담덕로고.png"
            alt="도담덕 로고"
            width={80}
            height={80}
          />
          <h2 className="text-xl font-bold">로그인</h2>

          {error && (
            <Alert variant="destructive" className="w-full">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="w-full">
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="userID">아이디</Label>
                <Input
                  id="userID"
                  placeholder="아이디를 입력하세요"
                  {...register('userID')}
                />
                <FormFieldError message={errors.userID?.message} />
              </div>
              <div>
                <Label htmlFor="userPassword">비밀번호</Label>
                <PasswordInput
                  id="userPassword"
                  placeholder="비밀번호를 입력하세요"
                  {...register('userPassword')}
                />
                <FormFieldError message={errors.userPassword?.message} />
              </div>
              <LoadingButton
                type="submit"
                className="w-full"
                loading={isLoading}
              >
                <LogIn size={18} />
                로그인
              </LoadingButton>
            </div>
          </form>

          <p className="text-sm text-muted-foreground">
            계정이 아직 없으신가요?{' '}
            <Link href="/signup" className="font-semibold text-dodam-500">
              회원가입
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
