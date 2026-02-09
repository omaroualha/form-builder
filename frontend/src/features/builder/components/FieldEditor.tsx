import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, GripVertical } from 'lucide-react';
import { OptionsEditor } from './OptionsEditor';
import { FIELD_TYPES } from '../constants';
import type { FormField } from '@/api/services/forms';

interface FieldEditorProps {
  field: FormField;
  index: number;
  onChange: (index: number, field: FormField) => void;
  onRemove: (index: number) => void;
}

function toFieldName(label: string): string {
  return label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

export function FieldEditor({ field, index, onChange, onRemove }: FieldEditorProps) {
  const needsOptions = field.type === 'select' || field.type === 'radio';
  const nameEdited = useRef(false);

  const update = (updates: Partial<FormField>) => {
    onChange(index, { ...field, ...updates });
  };

  const onLabelChange = (label: string) => {
    if (nameEdited.current) {
      update({ label });
    } else {
      update({ label, name: toFieldName(label) });
    }
  };

  const onNameChange = (name: string) => {
    nameEdited.current = true;
    update({ name });
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start gap-4">
          <GripVertical className="w-5 h-5 text-muted-foreground mt-2 cursor-grab" />

          <div className="flex-1 space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={field.type}
                  onValueChange={(v) => update({ type: v as FormField['type'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Label</Label>
                <Input
                  value={field.label}
                  onChange={(e) => onLabelChange(e.target.value)}
                  placeholder="Field label"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={field.name}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder="field_name"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`required-${index}`}
                  checked={field.required || false}
                  onCheckedChange={(checked) => update({ required: checked === true })}
                />
                <Label htmlFor={`required-${index}`}>Required</Label>
              </div>
              {!needsOptions && (
                <Input
                  value={field.placeholder || ''}
                  onChange={(e) => update({ placeholder: e.target.value })}
                  placeholder="Placeholder text"
                  className="flex-1"
                />
              )}
            </div>

            {needsOptions && (
              <OptionsEditor
                options={field.options || []}
                onChange={(options) => update({ options })}
              />
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => onRemove(index)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
