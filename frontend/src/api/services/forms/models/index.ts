export interface FieldOption {
  label: string;
  value: string;
}

export interface FormField {
  type: 'text' | 'textarea' | 'number' | 'email' | 'date' | 'select' | 'radio' | 'checkbox';
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  options?: FieldOption[];
}

export interface Form {
  id: string;
  title: string;
  slug: string;
  fields: FormField[];
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  form_id: string;
  data: Record<string, unknown>;
  created_at: string;
}

export interface CreateFormData {
  title: string;
  fields?: FormField[];
}

export interface UpdateFormData {
  title?: string;
  fields?: FormField[];
  status?: 'draft' | 'published';
}
