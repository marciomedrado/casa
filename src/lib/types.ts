import type { LucideIcon } from 'lucide-react';

export type User = {
  name: string;
  avatar: string;
  email: string;
};

export type Property = {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
  imageHint: string;
};

export type Location = {
  id: string;
  name: string;
  propertyId: string;
  parentId: string | null;
  type: 'room' | 'cabinet' | 'shelf' | 'drawer' | 'box' | 'bin' | 'other';
  icon: string;
  children: Location[];
};

export type Item = {
  id: string;
  name:string;
  description: string;
  quantity: number;
  tags: string[];
  imageUrl: string;
  imageHint: string;
  locationId: string;
  parentId: string | null; // If inside another item
  isContainer: boolean;
  propertyId: string;
  locationPath: string[];
  children?: Item[];
};
