import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BuilderHeaderProps {
  isEditing: boolean;
  isPending: boolean;
}

export function BuilderHeader({ isEditing, isPending }: BuilderHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">
            {isEditing ? "Edit Form" : "Create Form"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button type="submit" form="form-builder" disabled={isPending}>
            {isPending ? "Saving..." : "Save Form"}
          </Button>
        </div>
      </div>
    </header>
  );
}
