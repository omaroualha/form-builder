import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';

vi.mock('@/api', () => ({
  api: {
    auth: { getUser: vi.fn(), login: vi.fn(), register: vi.fn(), logout: vi.fn() },
    forms: { getAll: vi.fn(), getById: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
    setAccessToken: vi.fn(),
  },
}));

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});
