'use client';

import { User } from '@/types';

/**
 * Check if a user has admin privileges
 */
export function isAdmin(user: User | null): boolean {
  return user?.isAdmin === true;
}

/**
 * Check if a user account is active
 */
export function isActiveUser(user: User | null): boolean {
  return user?.status === 'active' || user?.status === undefined;
}

/**
 * Check if a user can access admin features
 */
export function canAccessAdmin(user: User | null): boolean {
  return isAdmin(user) && isActiveUser(user);
}
