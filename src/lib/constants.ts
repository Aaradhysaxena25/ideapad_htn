import type { ActionType } from '@/types';
import {
  Wrench,
  Repeat,
  Recycle,
  ArrowLeftRight,
  Printer,
  Trash2,
} from 'lucide-react';

export const ACTION_META: Record<ActionType, {
  label: string;
  color: string;
  bg: string;
  border: string;
  text: string;
  icon: typeof Wrench;
  glow: string;
}> = {
  REPAIR: {
    label: 'Repair',
    color: '#3b82f6',
    bg: 'bg-blue-500/15',
    border: 'border-blue-500/40',
    text: 'text-blue-300',
    icon: Wrench,
    glow: 'shadow-blue-500/20',
  },
  REUSE: {
    label: 'Reuse',
    color: '#10b981',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/40',
    text: 'text-emerald-300',
    icon: Repeat,
    glow: 'shadow-emerald-500/20',
  },
  RECYCLE: {
    label: 'Recycle',
    color: '#f59e0b',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/40',
    text: 'text-amber-300',
    icon: Recycle,
    glow: 'shadow-amber-500/20',
  },
  EXCHANGE: {
    label: 'Exchange',
    color: '#06b6d4',
    bg: 'bg-cyan-500/15',
    border: 'border-cyan-500/40',
    text: 'text-cyan-300',
    icon: ArrowLeftRight,
    glow: 'shadow-cyan-500/20',
  },
  '3D_PRINT': {
    label: '3D Print',
    color: '#ec4899',
    bg: 'bg-pink-500/15',
    border: 'border-pink-500/40',
    text: 'text-pink-300',
    icon: Printer,
    glow: 'shadow-pink-500/20',
  },
  DISCARD: {
    label: 'Discard',
    color: '#6b7280',
    bg: 'bg-gray-500/15',
    border: 'border-gray-500/40',
    text: 'text-gray-300',
    icon: Trash2,
    glow: 'shadow-gray-500/20',
  },
};

export const LOCATIONS = [
  'Mars Habitat A',
  'Mars Habitat B',
  'Moon Base 1',
  'Orbital Station',
  'Rover Unit 7',
];

export const CATEGORIES = [
  'Storage',
  'Tool',
  'Equipment',
  'Container',
  'Material',
  'Electronics',
  'Hardware',
];

export const CONDITIONS = ['Good', 'Worn', 'Damaged', 'Critical'];
export const DAMAGE_LEVELS = ['None', 'Low', 'Medium', 'High'];
