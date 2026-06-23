'use client';

import {
  Badge,
  Box,
  Button,
  Card,
  Center,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Alert,
} from '@mantine/core';
import { IconPhone } from '@tabler/icons-react';

import { useLibraryItems } from '@/services/library/useLibrary';
import { getCategoryConfig } from '@/services/library/library-services';
import type { LibraryItem } from '@/services/library/library.types';

function ToyCard({ item }: { item: LibraryItem }) {
  const config = getCategoryConfig(item['영 역']);
  const Icon = config.icon;

  return (
    <Card
      shadow="sm"
      padding={0}
      radius="md"
      withBorder
      className="transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <Card.Section>
        <Box
          className="flex items-center justify-center"
          style={{ background: config.gradient, height: 140 }}
        >
          <Icon size={56} color="white" stroke={1.5} />
        </Box>
      </Card.Section>

      <Stack gap="xs" className="p-4">
        <Text fw={600} size="md" lineClamp={1}>
          {item.장난감명}
        </Text>

        <Badge color={config.color} variant="light" size="sm" className="w-fit">
          {item['영 역']}
        </Badge>

        <Stack gap={4}>
          <Text size="sm" c="dimmed">
            사용연령: {item.사용연령}
          </Text>
          <Text size="sm" c="dimmed">
            대여료: {item.대여료}
          </Text>
          {item.제조사 && (
            <Text size="sm" c="dimmed">
              제조사: {item.제조사}
            </Text>
          )}
        </Stack>

        {item.관리기관전화번호 ? (
          <Button
            component="a"
            href={`tel:${item.관리기관전화번호}`}
            variant="outline"
            fullWidth
            size="sm"
            leftSection={<IconPhone size={16} />}
          >
            대여 문의
          </Button>
        ) : (
          <Button variant="outline" fullWidth size="sm" disabled>
            대여 문의
          </Button>
        )}
      </Stack>
    </Card>
  );
}

export default function LibraryPage() {
  const { data: items, isLoading, error } = useLibraryItems();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Stack align="center" gap="xs" className="mb-10">
        <Text c="dimmed" size="lg">
          원하는 장난감을 빌릴 수 있는
        </Text>
        <Title order={1}>장난감 도서관</Title>
      </Stack>

      {isLoading && (
        <Center className="min-h-[40vh]">
          <Loader size="lg" />
        </Center>
      )}

      {error && (
        <Alert color="red" className="mx-auto max-w-md">
          장난감 목록을 불러오는 데 실패했습니다.
        </Alert>
      )}

      {items && (
        <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 4 }} spacing="lg">
          {items.map((item) => (
            <ToyCard key={item.순번} item={item} />
          ))}
        </SimpleGrid>
      )}
    </div>
  );
}
