import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from '@/features/forms/hooks/useForms';
import { api } from '@/api';
import type { FormField, UpdateFormData } from '@/api/services/forms';

export function useFormBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  const { data: form, isLoading } = useForm(id!);

  const createMutation = useMutation({
    mutationFn: (data: { title: string; fields: FormField[] }) => api.forms.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      navigate(`/forms/${data.id}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateFormData) => api.forms.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      queryClient.invalidateQueries({ queryKey: ['form', id] });
    },
  });

  useEffect(() => {
    if (form) {
      setTitle(form.title);
      setFields(form.fields);
      setStatus(form.status);
    }
  }, [form]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const save = () => {
    if (isEditing && id) {
      updateMutation.mutate({ title, fields, status });
    } else {
      createMutation.mutate({ title, fields });
    }
  };

  const addField = () => {
    setFields([...fields, { type: 'text', label: '', name: '', required: false }]);
  };

  const updateField = (index: number, field: FormField) => {
    const updated = [...fields];
    updated[index] = field;
    setFields(updated);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const togglePublish = async () => {
    if (!id) return;
    const newStatus = status === 'draft' ? 'published' : 'draft';
    await updateMutation.mutateAsync({ status: newStatus });
  };

  return {
    form,
    isEditing,
    isLoading: isEditing && isLoading,
    isPending,
    title,
    setTitle,
    fields,
    status,
    save,
    addField,
    updateField,
    removeField,
    togglePublish,
  };
}
