/**
 * API functions for Notifications.
 */

import type { Notification } from "@/lib/types";
import { getNotificationsForUser as _getNotificationsForUser } from "@/lib/db";

export async function getNotificationsForUser(
  userId: string,
): Promise<Notification[]> {
  return _getNotificationsForUser(userId);
}
