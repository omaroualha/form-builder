import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';

export function useForms() {
  return useQuery({
    queryKey: ['forms'],
    queryFn: () => api.forms.getAll(),
  });
}

export function useForm(id: string) {
  return useQuery({
    queryKey: ['form', id],
    queryFn: () => api.forms.getById(id),
    enabled: Boolean(id),
  });
}

export function useDeleteForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.forms.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
    },
  });
}

export function useFormSubmissions(formId: string) {
  return useQuery({
    queryKey: ['submissions', formId],
    queryFn: () => api.forms.getSubmissions(formId),
    enabled: Boolean(formId),
  });
}
