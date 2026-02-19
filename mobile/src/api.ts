import type { Form, Submission } from './types';

const API_BASE_URL = 'http://65.21.252.253/api';

interface DataWrapper<T> {
  data: T;
}

export async function fetchPublicForm(slug: string): Promise<Form> {
  const response = await fetch(`${API_BASE_URL}/public/forms/${slug}`);
  if (!response.ok) throw new Error('Form not found');
  const json: DataWrapper<Form> = await response.json();
  return json.data;
}

export async function submitPublicForm(slug: string, data: Record<string, unknown>): Promise<Submission> {
  const response = await fetch(`${API_BASE_URL}/public/forms/${slug}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ data }),
  });
  if (!response.ok) throw new Error('Submission failed');
  const json: DataWrapper<Submission> = await response.json();
  return json.data;
}
