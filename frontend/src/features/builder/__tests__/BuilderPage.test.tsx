import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '@/test/utils';
import { BuilderPage } from '../pages/BuilderPage';

vi.mock('@/api', () => ({
  api: {
    auth: {
      getUser: vi.fn(),
    },
    forms: {
      create: vi.fn(),
      getById: vi.fn(),
      update: vi.fn(),
      getAll: vi.fn(),
    },
    setAccessToken: vi.fn(),
  },
}));

import { api } from '@/api';

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

function renderBuilderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/forms/new" element={<BuilderPage />} />
    </Routes>,
    { route: '/forms/new' },
  );
}

describe('BuilderPage', () => {
  it('renders create form header', () => {
    renderBuilderPage();

    expect(screen.getByText('Create Form')).toBeInTheDocument();
  });

  it('shows title input', () => {
    renderBuilderPage();

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
  });

  it('shows empty fields state', () => {
    renderBuilderPage();

    expect(screen.getByText(/no fields yet/i)).toBeInTheDocument();
  });

  it('adds a field when clicking Add Field', async () => {
    const user = userEvent.setup();
    renderBuilderPage();

    const addButtons = screen.getAllByRole('button', { name: /add field/i });
    await user.click(addButtons[0]);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Field label')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('field_name')).toBeInTheDocument();
    });
  });

  it('shows save button', () => {
    renderBuilderPage();

    expect(screen.getByRole('button', { name: /save form/i })).toBeInTheDocument();
  });

  it('does not show publish button in create mode', () => {
    renderBuilderPage();

    expect(screen.queryByRole('button', { name: /publish/i })).not.toBeInTheDocument();
  });

  it('can add multiple fields', async () => {
    const user = userEvent.setup();
    renderBuilderPage();

    const addButtons = screen.getAllByRole('button', { name: /add field/i });
    await user.click(addButtons[0]);
    await user.click(addButtons[0]);

    await waitFor(() => {
      const labels = screen.getAllByPlaceholderText('Field label');
      expect(labels).toHaveLength(2);
    });
  });

  it('removes empty state after adding a field', async () => {
    const user = userEvent.setup();
    renderBuilderPage();

    expect(screen.getByText(/no fields yet/i)).toBeInTheDocument();

    const addButtons = screen.getAllByRole('button', { name: /add field/i });
    await user.click(addButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText(/no fields yet/i)).not.toBeInTheDocument();
    });
  });

  it('shows loading state when editing an existing form', () => {
    vi.mocked(api.forms.getById).mockImplementation(() => new Promise(() => {}));

    renderWithProviders(
      <Routes>
        <Route path="/forms/:id" element={<BuilderPage />} />
      </Routes>,
      { route: '/forms/123' },
    );

    expect(screen.getByText(/loading form/i)).toBeInTheDocument();
  });

  it('removes a field when clicking the delete button', async () => {
    const user = userEvent.setup();
    renderBuilderPage();

    // Add two fields
    const addButtons = screen.getAllByRole('button', { name: /add field/i });
    await user.click(addButtons[0]);
    await user.click(addButtons[0]);

    await waitFor(() => {
      expect(screen.getAllByPlaceholderText('Field label')).toHaveLength(2);
    });

    // Delete the first field
    const deleteButtons = screen.getAllByRole('button').filter((btn) =>
      btn.querySelector('svg.lucide-trash2, svg.lucide-trash-2'),
    );
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getAllByPlaceholderText('Field label')).toHaveLength(1);
    });
  });

  it('auto-generates field name from label', async () => {
    const user = userEvent.setup();
    renderBuilderPage();

    const addButtons = screen.getAllByRole('button', { name: /add field/i });
    await user.click(addButtons[0]);

    const labelInput = await screen.findByPlaceholderText('Field label');
    await user.type(labelInput, 'Full Name');

    const nameInput = screen.getByPlaceholderText('field_name');
    expect(nameInput).toHaveValue('full_name');
  });

  it('stops auto-generating name once user edits it manually', async () => {
    const user = userEvent.setup();
    renderBuilderPage();

    const addButtons = screen.getAllByRole('button', { name: /add field/i });
    await user.click(addButtons[0]);

    const labelInput = await screen.findByPlaceholderText('Field label');
    const nameInput = screen.getByPlaceholderText('field_name');

    // Type label first — name should auto-sync
    await user.type(labelInput, 'Email');
    expect(nameInput).toHaveValue('email');

    // Now manually edit the name
    await user.clear(nameInput);
    await user.type(nameInput, 'custom_email');

    // Type more in label — name should NOT change anymore
    await user.clear(labelInput);
    await user.type(labelInput, 'Work Email');
    expect(nameInput).toHaveValue('custom_email');
  });
});
