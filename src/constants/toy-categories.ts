import {
  Box,
  Home,
  Baby,
  Music,
  Car,
  Hand,
  Puzzle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ToyCategory } from '@/services/library/library.types';

export interface CategoryConfig {
  icon: LucideIcon;
  color: string;
  gradient: string;
}

const CATEGORY_CONFIG: Record<ToyCategory, CategoryConfig> = {
  '블록': {
    icon: Box,
    color: 'blue',
    gradient: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
  },
  '역할/소꿉': {
    icon: Home,
    color: 'pink',
    gradient: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)',
  },
  '육아용품': {
    icon: Baby,
    color: 'green',
    gradient: 'linear-gradient(135deg, #55efc4 0%, #00b894 100%)',
  },
  '음률': {
    icon: Music,
    color: 'violet',
    gradient: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)',
  },
  '자동차/모형': {
    icon: Car,
    color: 'orange',
    gradient: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
  },
  '조작/탐색': {
    icon: Hand,
    color: 'teal',
    gradient: 'linear-gradient(135deg, #81ecec 0%, #00cec9 100%)',
  },
  '퍼즐/게임': {
    icon: Puzzle,
    color: 'yellow',
    gradient: 'linear-gradient(135deg, #ffeaa7 0%, #f9ca24 100%)',
  },
};

const DEFAULT_CONFIG: CategoryConfig = {
  icon: Box,
  color: 'gray',
  gradient: 'linear-gradient(135deg, #b2bec3 0%, #636e72 100%)',
};

export function getCategoryConfig(category: string): CategoryConfig {
  return CATEGORY_CONFIG[category as ToyCategory] ?? DEFAULT_CONFIG;
}
