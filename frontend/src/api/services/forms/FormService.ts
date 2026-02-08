import { AbstractService } from '../../AbstractService';
import type { Form, CreateFormData, UpdateFormData, Submission } from './models';

interface DataWrapper<T> {
  data: T;
}

export class FormService extends AbstractService {
  async getAll(): Promise<Form[]> {
    const response = await this.get<DataWrapper<Form[]>>('/forms');
    return response.data;
  }

  async getById(id: string): Promise<Form> {
    const response = await this.get<DataWrapper<Form>>(`/forms/${id}`);
    return response.data;
  }

  async create(data: CreateFormData): Promise<Form> {
    const response = await this.post<DataWrapper<Form>>('/forms', data);
    return response.data;
  }

  async update(id: string, data: UpdateFormData): Promise<Form> {
    const response = await this.put<DataWrapper<Form>>(`/forms/${id}`, data);
    return response.data;
  }

  async remove(id: string): Promise<void> {
    await this.delete(`/forms/${id}`);
  }

  async getSubmissions(formId: string): Promise<Submission[]> {
    const response = await this.get<DataWrapper<Submission[]>>(`/forms/${formId}/submissions`);
    return response.data;
  }

  async getPublicForm(slug: string): Promise<Form> {
    const response = await this.get<DataWrapper<Form>>(`/public/forms/${slug}`);
    return response.data;
  }

  async submitPublicForm(slug: string, data: Record<string, unknown>): Promise<Submission> {
    const response = await this.post<DataWrapper<Submission>>(`/public/forms/${slug}/submit`, { data });
    return response.data;
  }
}
