'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Button,
  TextInput,
  PasswordInput,
  Checkbox,
  Stack,
  Text,
  Alert,
  Center,
  Paper,
} from '@mantine/core';
import { useForm, schemaResolver } from '@mantine/form';
import { signupSchema, type SignupForm } from '@/libs/validations/auth';
import { servCheckUsername, servSignUp } from '@/services/auth/auth-services';

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [idStatus, setIdStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle');
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupForm>({
    validate: schemaResolver(signupSchema),
    initialValues: {
      userID: '',
      userPassword: '',
      location: '',
      agree: false,
    },
  });

  async function handleCheckID() {
    const userID = form.values.userID;
    if (!userID) return;

    setIdStatus('checking');
    try {
      const result = await servCheckUsername(userID);
      setIdStatus(result.isAvailable ? 'available' : 'taken');
    } catch {
      setIdStatus('idle');
    }
  }

  async function handleSubmit(values: SignupForm) {
    if (idStatus !== 'available') {
      setError('아이디 중복 확인을 해주세요.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await servSignUp({
        userID: values.userID,
        userPassword: values.userPassword,
        location: values.location,
      });

      router.push('/login');
    } catch {
      setError('회원가입 중 오류가 발생했습니다.');
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
            회원가입
          </Text>

          {error && (
            <Alert color="red" className="w-full">
              {error}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)} className="w-full">
            <Stack gap="md">
              <div>
                <TextInput
                  label="아이디"
                  placeholder="아이디를 입력하세요"
                  rightSection={
                    <Button
                      size="compact-xs"
                      variant="subtle"
                      onClick={handleCheckID}
                      loading={idStatus === 'checking'}
                    >
                      중복확인
                    </Button>
                  }
                  rightSectionWidth={80}
                  {...form.getInputProps('userID')}
                  onChange={(e) => {
                    form.getInputProps('userID').onChange(e);
                    setIdStatus('idle');
                  }}
                />
                {idStatus === 'available' && (
                  <Text size="xs" c="green" className="mt-1">
                    사용 가능한 아이디입니다.
                  </Text>
                )}
                {idStatus === 'taken' && (
                  <Text size="xs" c="red" className="mt-1">
                    이미 사용 중인 아이디입니다.
                  </Text>
                )}
              </div>

              <PasswordInput
                label="비밀번호"
                placeholder="8자 이상, 특수문자 포함"
                {...form.getInputProps('userPassword')}
              />

              <TextInput
                label="주소"
                placeholder="광주광역시 동구 필문대로 309"
                {...form.getInputProps('location')}
              />

              <Checkbox
                label="이용약관에 동의합니다"
                {...form.getInputProps('agree', { type: 'checkbox' })}
              />

              <Button type="submit" fullWidth loading={isLoading}>
                회원가입
              </Button>
            </Stack>
          </form>

          <Text size="sm" c="dimmed">
            이미 계정이 있으신가요?{' '}
            <Text component={Link} href="/login" c="dodamYellow.5" fw={600}>
              로그인
            </Text>
          </Text>
        </Stack>
      </Paper>
    </Center>
  );
}
