'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Upload, X } from 'lucide-react';
import { api } from '@/lib/api';

type IncidentType = 'damage' | 'accident' | 'mechanical' | 'other';
type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

interface CreateIncidentInput {
  booking_id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  official_photos?: string[];
  medical_response_required?: boolean;
  medical_notes?: string;
  user_unable_to_respond?: boolean;
  estimated_cost?: number;
}

interface IncidentFormProps {
  bookingId: string;
  onSuccess?: (incident: any) => void;
  onCancel?: () => void;
}

const TYPES: { value: IncidentType; label: string }[] = [
  { value: 'damage', label: 'Damage' },
  { value: 'accident', label: 'Accident' },
  { value: 'mechanical', label: 'Mechanical' },
  { value: 'other', label: 'Other' },
];

const SEVERITIES: { value: IncidentSeverity; label: string; desc: string; color: string }[] = [
  { value: 'low', label: 'Low', desc: 'Minor cosmetic', color: 'border-gray-200' },
  { value: 'medium', label: 'Medium', desc: 'Repairable', color: 'border-yellow-200' },
  { value: 'high', label: 'High', desc: 'Significant', color: 'border-orange-200' },
  { value: 'critical', label: 'Critical', desc: 'Severe/total loss', color: 'border-red-200' },
];

export function IncidentForm({ bookingId, onSuccess, onCancel }: IncidentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateIncidentInput>({
    defaultValues: {
      booking_id: bookingId,
      type: 'damage',
      severity: 'low',
      medical_response_required: false,
      user_unable_to_respond: false,
    },
  });

  const selectedType = watch('type');
  const selectedSeverity = watch('severity');
  const medicalResponse = watch('medical_response_required');
  const userUnableToRespond = watch('user_unable_to_respond');

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

  const onSubmit = async (data: CreateIncidentInput) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Upload photos first
      const uploadedUrls = await uploadPhotos();

      // Build clean payload — exclude NaN and empty optional fields
      const payload: Record<string, any> = {
        booking_id: data.booking_id,
        type: data.type,
        severity: data.severity,
        description: data.description,
        official_photos: uploadedUrls,
      };

      if (data.medical_response_required) {
        payload.medical_response_required = true;
        if (data.medical_notes) payload.medical_notes = data.medical_notes;
      }
      if (data.user_unable_to_respond) {
        payload.user_unable_to_respond = true;
      }
      if (data.estimated_cost && !isNaN(Number(data.estimated_cost)) && Number(data.estimated_cost) > 0) {
        payload.estimated_cost = Number(data.estimated_cost);
      }

      const res = await api.api.v1.incidents.post(payload as any);

      if (res.error) {
        const errorValue = res.error.value as any;
        throw new Error(errorValue?.error?.message || errorValue?.message || 'Failed to create incident report');
      }

      // Clean up preview URLs
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
      onSuccess?.(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to create incident report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Type */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Incident Type</Label>
        <RadioGroup
          value={selectedType}
          onValueChange={(v: string) => setValue('type', v as IncidentType)}
          className="grid grid-cols-4 gap-2"
        >
          {TYPES.map((t) => (
            <Label
              key={t.value}
              htmlFor={`type-${t.value}`}
              className={`flex items-center justify-center gap-2 border rounded-md p-3 cursor-pointer text-sm transition-colors ${
                selectedType === t.value ? 'border-primary bg-primary/5 font-medium' : 'hover:bg-muted/50'
              }`}
            >
              <RadioGroupItem value={t.value} id={`type-${t.value}`} className="sr-only" />
              {t.label}
            </Label>
          ))}
        </RadioGroup>
      </div>

      {/* Severity */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Severity</Label>
        <RadioGroup
          value={selectedSeverity}
          onValueChange={(v: string) => setValue('severity', v as IncidentSeverity)}
          className="grid grid-cols-4 gap-2"
        >
          {SEVERITIES.map((s) => (
            <Label
              key={s.value}
              htmlFor={`sev-${s.value}`}
              className={`flex flex-col items-center border rounded-md p-3 cursor-pointer text-center transition-colors ${
                selectedSeverity === s.value ? `${s.color} bg-primary/5 font-medium` : 'hover:bg-muted/50'
              }`}
            >
              <RadioGroupItem value={s.value} id={`sev-${s.value}`} className="sr-only" />
              <span className="text-sm">{s.label}</span>
              <span className="text-[10px] text-muted-foreground">{s.desc}</span>
            </Label>
          ))}
        </RadioGroup>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
        <Textarea
          id="description"
          {...register('description', {
            required: 'Description is required',
            minLength: { value: 20, message: 'Minimum 20 characters' },
          })}
          placeholder="Describe what happened, location, time, and relevant circumstances..."
          rows={4}
          className="resize-none"
        />
        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
      </div>

      {/* Photos */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Photos</Label>
        <div className="border-2 border-dashed rounded-md p-4">
          <div className="flex items-center justify-center gap-2">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Upload incident photos</span>
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

      {/* Emergency Section */}
      <div className="space-y-3 p-4 rounded-lg border border-red-200 bg-red-50/50">
        <p className="text-sm font-medium text-red-900">Emergency Response</p>
        <div className="flex items-center gap-2">
          <Checkbox
            id="medical_response"
            checked={medicalResponse}
            onCheckedChange={(checked: boolean) => setValue('medical_response_required', checked)}
          />
          <Label htmlFor="medical_response" className="text-sm text-red-900 cursor-pointer">
            Medical response required (ambulance called)
          </Label>
        </div>
        {medicalResponse && (
          <Textarea
            {...register('medical_notes')}
            placeholder="User condition, hospital, injuries..."
            rows={2}
            className="resize-none bg-white"
          />
        )}
        <div className="flex items-center gap-2">
          <Checkbox
            id="user_unable"
            checked={userUnableToRespond}
            onCheckedChange={(checked: boolean) => setValue('user_unable_to_respond', checked)}
          />
          <Label htmlFor="user_unable" className="text-sm text-red-900 cursor-pointer">
            User unable to respond (unconscious, injured, or deceased)
          </Label>
        </div>
      </div>

      {/* Cost */}
      <div className="space-y-1.5">
        <Label htmlFor="estimated_cost" className="text-sm font-medium">Estimated Cost (optional)</Label>
        <Input
          id="estimated_cost"
          type="number"
          step="0.01"
          {...register('estimated_cost', { valueAsNumber: true })}
          placeholder="0.00"
          className="max-w-[200px]"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Report'}
        </Button>
      </div>
    </form>
  );
}
