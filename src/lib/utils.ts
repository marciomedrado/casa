import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Location } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const buildLocationTree = (locations: Omit<Location, 'children'>[], parentId: string | null = null): Location[] => {
  return locations
    .filter(location => location.parentId === parentId)
    .map(location => ({
      ...location,
      children: buildLocationTree(locations, location.id),
    }));
};
