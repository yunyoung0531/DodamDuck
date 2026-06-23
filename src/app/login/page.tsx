'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Button,
  TextInput,
  PasswordInput,
  Stack,
  Text,
  Alert,
  Center,
  Paper,
  Loader,
} from '@mantine/core';
import { useForm, schemaResolver } from '@mantine/form';
import { IconLogin } from '@tabler/icons-react';
import { loginSchema, type LoginForm } from '@/libs/validations/auth';
import { servSignIn } from '@/services/auth/auth-services';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Center className="min-h-[calc(100vh-3.5rem)]">
          <Loader size="lg" />
        </Center>
      }
    >
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

  const form = useForm<LoginForm>({
    validate: schemaResolver(loginSchema),
    initialValues: {
      userID: '',
      userPassword: '',
    },
  });

  async function handleSubmit(values: LoginForm) {
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
    <Center className="min-h-[calc(100vh-3.5rem)] bg-dodam-light">
      <Paper shadow="sm" p="xl" radius="md" className="w-full max-w-md">
        <Stack align="center" gap="lg">
          <Image
            src="/images/도담덕로고.png"
            alt="도담덕 로고"
            width={80}
            height={80}
          />
          <Text fw={700} size="xl">
            로그인
          </Text>

          {error && (
            <Alert color="red" className="w-full">
              {error}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)} className="w-full">
            <Stack gap="md">
              <TextInput
                label="아이디"
                placeholder="아이디를 입력하세요"
                {...form.getInputProps('userID')}
              />
              <PasswordInput
                label="비밀번호"
                placeholder="비밀번호를 입력하세요"
                {...form.getInputProps('userPassword')}
              />
              <Button
                type="submit"
                fullWidth
                loading={isLoading}
                leftSection={<IconLogin size={18} />}
              >
                로그인
              </Button>
            </Stack>
          </form>

          <Text size="sm" c="dimmed">
            계정이 아직 없으신가요?{' '}
            <Text component={Link} href="/signup" c="dodamYellow.5" fw={600}>
              회원가입
            </Text>
          </Text>
        </Stack>
      </Paper>
    </Center>
  );
}
