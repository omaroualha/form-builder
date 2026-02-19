import { getPendingSubmissions, markSynced } from './db';
import { submitPublicForm } from './api';

export async function syncPendingSubmissions(): Promise<number> {
  const pending = await getPendingSubmissions();
  if (pending.length === 0) return 0;

  console.log(`[sync] Found ${pending.length} pending submission(s), syncing...`);
  let synced = 0;

  for (const submission of pending) {
    try {
      const data = JSON.parse(submission.data);
      await submitPublicForm(submission.slug, data);
      await markSynced(submission.id);
      synced++;
      console.log(`[sync] Synced submission #${submission.id}`);
    } catch (error) {
      console.log(`[sync] Failed to sync #${submission.id}:`, error);
    }
  }

  console.log(`[sync] Done — ${synced}/${pending.length} synced`);
  return synced;
}
