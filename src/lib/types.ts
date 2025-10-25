import type { User as FirebaseUser } from 'firebase/auth';

export type UserRole = 'admin' | 'vip' | 'free';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
}

export type User = FirebaseUser & UserProfile;

export type Property = {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
  imageHint: string;
  ownerId: string;
};

export type Location = {
  id:string;
  name: string;
  propertyId: string;
  parentId: string | null;
  type: 'room' | 'cabinet' | 'shelf' | 'drawer' | 'box' | 'bin' | 'other';
  icon: string;
  children: Location[];
};

export type SubContainer = {
  type: 'door' | 'drawer';
  number: number;
}

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
  doorCount?: number;
  drawerCount?: number;
  propertyId: string;
  locationPath: string[];
  subContainer?: SubContainer | null; // Which door/drawer it's in
  ownerId: string;
};
