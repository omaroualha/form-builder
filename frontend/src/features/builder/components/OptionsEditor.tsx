import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import type { FieldOption } from '@/api/services/forms';

interface OptionsEditorProps {
  options: FieldOption[];
  onChange: (options: FieldOption[]) => void;
}

export function OptionsEditor({ options, onChange }: OptionsEditorProps) {
  const add = () => onChange([...options, { label: '', value: '' }]);

  const update = (index: number, updates: Partial<FieldOption>) => {
    const updated = [...options];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const remove = (index: number) => onChange(options.filter((_, i) => i !== index));

  return (
    <div className="space-y-2">
      <Label>Options</Label>
      {options.map((option, i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={option.label}
            onChange={(e) => update(i, { label: e.target.value })}
            placeholder="Label"
            className="flex-1"
          />
          <Input
            value={option.value}
            onChange={(e) => update(i, { value: e.target.value })}
            placeholder="Value"
            className="flex-1"
          />
          <Button type="button" variant="outline" size="icon" onClick={() => remove(i)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="w-4 h-4 mr-1" />
        Add Option
      </Button>
    </div>
  );
}
