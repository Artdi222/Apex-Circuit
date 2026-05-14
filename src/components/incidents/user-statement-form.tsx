'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Upload, X, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface AddUserStatementInput {
  statement: string;
  photos?: string[];
}

interface UserStatementFormProps {
  incidentId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UserStatementForm({ incidentId, onSuccess, onCancel }: UserStatementFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<AddUserStatementInput>();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPhotoFiles((prev) => [...prev, ...newFiles]);
    setPhotoPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async (): Promise<string[]> => {
    if (photoFiles.length === 0) return [];
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const token = localStorage.getItem('access_token');

    const formData = new FormData();
    for (const file of photoFiles) {
      formData.append('images', file);
    }
    formData.append('subDir', 'incidents');

    const res = await fetch(`${API_BASE}/api/v1/uploads/images`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) throw new Error('Failed to upload photos');
    const json = await res.json();
    return json.data?.urls || [];
  };

  const onSubmit = async (data: AddUserStatementInput) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const uploadedUrls = await uploadPhotos();

      const res = await (api.api.v1.incidents as any)[incidentId]['user-statement'].post({
        statement: data.statement,
        photos: uploadedUrls,
      });

      if (res.error) {
        const errorValue = res.error.value as any;
        throw new Error(errorValue?.error?.message || errorValue?.message || 'Failed to submit statement');
      }

      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
      setSuccess(true);
      setTimeout(() => onSuccess?.(), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit statement');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Your statement has been submitted successfully. The admin team will review it.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Your Statement</CardTitle>
          <CardDescription>
            Provide your account of what happened. This will be added to the official incident report.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="statement" className="text-sm font-medium">Your Statement *</Label>
            <Textarea
              id="statement"
              {...register('statement', {
                required: 'Statement is required',
                minLength: { value: 20, message: 'Minimum 20 characters' },
              })}
              placeholder="Describe what happened from your perspective..."
              rows={6}
              className="resize-none"
            />
            {errors.statement && <p className="text-xs text-destructive">{errors.statement.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Your Photos (optional)</Label>
            <div className="border-2 border-dashed rounded-md p-4">
              <div className="flex items-center justify-center gap-2">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Upload your photos</span>
                <Input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="max-w-[200px] h-8" />
              </div>
            </div>
            {photoPreviews.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {photoPreviews.map((preview, i) => (
                  <div key={i} className="relative group">
                    <img src={preview} alt="" className="w-16 h-16 object-cover rounded border" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              You can only submit your statement once. Make sure it is complete and accurate.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Statement'}
        </Button>
      </div>
    </form>
  );
}
