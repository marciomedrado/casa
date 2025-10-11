'use client';

import {
  Box,
  Library,
  Drill,
  Wine,
  FolderKanban,
  Home,
  DoorOpen,
  Warehouse,
  Archive,
  BookOpen,
  FileText,
  GanttChartSquare,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';

export const ICONS: { [key: string]: LucideIcon } = {
  Box,
  Library,
  Drill,
  Wine,
  FolderKanban,
  Home,
  DoorOpen,
  Warehouse,
  Archive,
  BookOpen,
  FileText,
  GanttChartSquare,
};

export const Icon = ({ name, ...props }: { name: string } & LucideProps) => {
  const LucideIcon = ICONS[name];
  if (!LucideIcon) {
    return null;
  }
  return <LucideIcon {...props} />;
};
