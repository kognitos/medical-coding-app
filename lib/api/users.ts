/**
 * API functions for Users.
 */

import type { User, UserRole } from "@/lib/types";
import { MOCK_USERS } from "@/lib/types";
import { getAllUsers, getUserById as _getUserById } from "@/lib/db";

export async function listUsers(): Promise<User[]> {
  return getAllUsers();
}

export async function getUserById(id: string): Promise<User | undefined> {
  return _getUserById(id);
}

export function getUserForRole(role: UserRole): User {
  return MOCK_USERS[role];
}
