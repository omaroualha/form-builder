import * as SQLite from 'expo-sqlite';
import type { Form } from './types';

let db: SQLite.SQLiteDatabase;

export async function initDB(): Promise<void> {
  db = await SQLite.openDatabaseAsync('formbuilder.db');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS forms (
      slug TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      fields TEXT NOT NULL,
      fetched_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pending_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending'
    );
  `);
}

export async function cacheForm(form: Form): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO forms (slug, title, fields, fetched_at) VALUES (?, ?, ?, ?)`,
    form.slug,
    form.title,
    JSON.stringify(form.fields),
    new Date().toISOString()
  );
}

export async function getCachedForm(slug: string): Promise<Form | null> {
  const row = await db.getFirstAsync<{ slug: string; title: string; fields: string }>(
    `SELECT slug, title, fields FROM forms WHERE slug = ?`,
    slug
  );
  if (!row) return null;
  return {
    id: '',
    slug: row.slug,
    title: row.title,
    fields: JSON.parse(row.fields),
    status: 'published',
    created_at: '',
    updated_at: '',
  };
}

export async function getCachedForms(): Promise<{ slug: string; title: string; fetched_at: string }[]> {
  return db.getAllAsync<{ slug: string; title: string; fetched_at: string }>(
    `SELECT slug, title, fetched_at FROM forms ORDER BY fetched_at DESC`
  );
}

export async function saveSubmission(slug: string, data: Record<string, unknown>): Promise<void> {
  await db.runAsync(
    `INSERT INTO pending_submissions (slug, data, created_at, status) VALUES (?, ?, ?, 'pending')`,
    slug,
    JSON.stringify(data),
    new Date().toISOString()
  );
}

export async function getPendingSubmissions(): Promise<{ id: number; slug: string; data: string }[]> {
  return db.getAllAsync<{ id: number; slug: string; data: string }>(
    `SELECT id, slug, data FROM pending_submissions WHERE status = 'pending'`
  );
}

export async function markSynced(id: number): Promise<void> {
  await db.runAsync(`UPDATE pending_submissions SET status = 'synced' WHERE id = ?`, id);
}

export async function getPendingCount(): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM pending_submissions WHERE status = 'pending'`
  );
  return row?.count ?? 0;
}
