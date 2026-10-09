'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingButton } from '@/components/common/LoadingButton';
import { PasswordInput } from '@/components/common/PasswordInput';
import { FormFieldError } from '@/components/common/FormFieldError';
import { FormField } from '@/components/common/FormField';
import { LoadingState } from '@/components/common/LoadingState';
import { UserIdField } from '@/app/signup/components/UserIdField';
import { signupSchema, type SignupForm } from '@/libs/validations/auth';
import { buildAuthHref, toSafeCallbackUrl } from '@/libs/auth-redirect';
import { servCheckUsername, servSignUp } from '@/services/auth/auth-services';

export default function SignupPage() {
  return (
    <Suspense fallback={<LoadingState height="full" />}>
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = toSafeCallbackUrl(searchParams.get('callbackUrl'));
  const [error, setError] = useState('');
  const [idStatus, setIdStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      userID: '',
      userPassword: '',
      agree: false,
    },
  });

  const userIDValue = watch('userID');

  async function handleCheckID() {
    if (!userIDValue) return;

    setIdStatus('checking');
    try {
      const result = await servCheckUsername(userIDValue);
      setIdStatus(result.isAvailable ? 'available' : 'taken');
    } catch {
      setIdStatus('idle');
    }
  }

  async function onSubmit(values: SignupForm) {
    if (idStatus !== 'available') {
      setError('아이디 중복 확인을 해주세요.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const { session } = await servSignUp({
        userID: values.userID,
        userPassword: values.userPassword,
      });

      if (session) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        router.push(buildAuthHref('/signin', callbackUrl));
      }
    } catch {
      setError('회원가입 중 오류가 발생했습니다.');
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
          <h2 className="text-xl font-bold">회원가입</h2>

          {error && (
            <Alert variant="destructive" className="w-full">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="w-full">
            <div className="flex flex-col gap-4">
              <UserIdField
                status={idStatus}
                register={register('userID', {
                  onChange: () => setIdStatus('idle'),
                })}
                error={errors.userID?.message}
                onCheck={handleCheckID}
              />

              <FormField
                htmlFor="userPassword"
                label="비밀번호"
                error={errors.userPassword?.message}
              >
                <PasswordInput
                  id="userPassword"
                  placeholder="8자 이상, 특수문자 포함"
                  {...register('userPassword')}
                />
              </FormField>

              <Controller
                name="agree"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="agree"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label htmlFor="agree" className="cursor-pointer">
                      이용약관에 동의합니다
                    </Label>
                  </div>
                )}
              />
              <FormFieldError message={errors.agree?.message} />

              <LoadingButton
                type="submit"
                className="w-full"
                loading={isLoading}
              >
                회원가입
              </LoadingButton>
            </div>
          </form>

          <p className="text-sm text-muted-foreground">
            이미 계정이 있으신가요?{' '}
            <Link
              href={buildAuthHref('/signin', callbackUrl)}
              className="font-semibold text-dodam-500"
            >
              로그인
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
