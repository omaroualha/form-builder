import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useFormBuilder } from "../hooks/useFormBuilder";
import { BuilderHeader } from "../components/BuilderHeader";
import { FieldEditor } from "../components/FieldEditor";

export function BuilderPage() {
  const builder = useFormBuilder();

  if (builder.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading form...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <BuilderHeader
        isEditing={builder.isEditing}
        isPending={builder.isPending}
        status={builder.status}
        slug={builder.form?.slug}
        onTogglePublish={builder.togglePublish}
      />

      <main className="container mx-auto px-4 py-8">
        <form
          id="form-builder"
          onSubmit={(e) => {
            e.preventDefault();
            builder.save();
          }}
          className="space-y-6 max-w-3xl mx-auto"
        >
          <Card>
            <CardHeader>
              <CardTitle>Form Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={builder.title}
                  onChange={(e) => builder.setTitle(e.target.value)}
                  placeholder="My Form"
                  required
                />
              </div>
              {builder.isEditing && builder.form?.slug && (
                <p className="text-sm text-muted-foreground mt-2">
                  Public URL: /f/{builder.form.slug}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Fields</h2>
              <Button
                type="button"
                variant="outline"
                onClick={builder.addField}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </div>

            {builder.fields.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    No fields yet. Add your first field.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={builder.addField}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Field
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {builder.fields.map((field, index) => (
                  <FieldEditor
                    key={index}
                    field={field}
                    index={index}
                    onChange={builder.updateField}
                    onRemove={builder.removeField}
                  />
                ))}
              </div>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
