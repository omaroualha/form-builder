import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePublicForm, useSubmitPublicForm } from '../hooks/useForms';
import type { FormField } from '@/api/services/forms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface FieldRendererProps {
  field: FormField;
  value: unknown;
  onChange: (name: string, value: unknown) => void;
}

function FieldRenderer({ field, value, onChange }: FieldRendererProps) {
  const handleChange = (newValue: unknown) => {
    onChange(field.name, newValue);
  };

  switch (field.type) {
    case 'text':
    case 'email':
    case 'number':
    case 'date':
      return (
        <Input
          type={field.type}
          value={(value as string) || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
        />
      );

    case 'textarea':
      return (
        <Textarea
          value={(value as string) || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
        />
      );

    case 'select':
      return (
        <>
          <Select value={(value as string) || ''} onValueChange={handleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {field.required && (
            <input type="hidden" value={(value as string) || ''} required />
          )}
        </>
      );

    case 'radio':
      return (
        <div className="space-y-2">
          {field.options?.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${field.name}-${option.value}`}
                name={field.name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => handleChange(e.target.value)}
                required={field.required}
                className="w-4 h-4"
              />
              <Label htmlFor={`${field.name}-${option.value}`}>{option.label}</Label>
            </div>
          ))}
        </div>
      );

    case 'checkbox':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={field.name}
            checked={(value as boolean) || false}
            onCheckedChange={handleChange}
          />
          <Label htmlFor={field.name}>{field.label}</Label>
        </div>
      );

    default:
      return null;
  }
}

export function PublicFormPage() {
  const { slug } = useParams();
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [submitted, setSubmitted] = useState(false);

  const { data: form, isLoading, error } = usePublicForm(slug!);
  const submitMutation = useSubmitPublicForm(slug!);

  // Initialize formData with field names so the payload is never empty
  useEffect(() => {
    if (form) {
      const initial: Record<string, unknown> = {};
      form.fields.forEach((f) => initial[f.name] = '');
      setFormData(initial);
    }
  }, [form]);

  const handleFieldChange = (name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(formData, {
      onSuccess: () => setSubmitted(true),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading form...</p>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive">Form not found or not available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Thank you!</h2>
            <p className="text-muted-foreground">Your response has been submitted successfully.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{form.title}</CardTitle>
            {form.fields.length > 0 && (
              <CardDescription>
                Please fill out the form below
              </CardDescription>
            )}
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {form.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  {field.type !== 'checkbox' && (
                    <Label>
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                  )}
                  <FieldRenderer
                    field={field}
                    value={formData[field.name]}
                    onChange={handleFieldChange}
                  />
                </div>
              ))}
              {submitMutation.error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                  Failed to submit form. Please try again.
                </div>
              )}
              <Button type="submit" className="w-full" disabled={submitMutation.isPending}>
                {submitMutation.isPending ? 'Submitting...' : 'Submit'}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
