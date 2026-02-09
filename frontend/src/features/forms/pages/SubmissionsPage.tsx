import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFormSubmissions } from '../hooks/useForms';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import type { Submission } from '@/api/services/forms';

export function SubmissionsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: form, isLoading: formLoading } = useForm(id!);
  const { data: submissions, isLoading: submissionsLoading } = useFormSubmissions(id!);

  const isLoading = formLoading || submissionsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading submissions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Submissions</h1>
            <p className="text-sm text-muted-foreground">{form?.title}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {submissions?.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">No submissions yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {submissions?.map((submission: Submission, index: number) => (
              <Card key={submission.id}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Submission #{submissions.length - index}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {new Date(submission.created_at).toLocaleString()}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    {Object.entries(submission.data).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{key}</p>
                        <p className="text-sm">
                          {typeof value === 'boolean'
                            ? value
                              ? 'Yes'
                              : 'No'
                            : String(value) || '-'}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
