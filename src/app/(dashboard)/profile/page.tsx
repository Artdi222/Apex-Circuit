'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { UserCircle, Mail, Phone, Save, Loader2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { api, unwrap } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, isInitialized, refreshUser } = useAuth();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username || '',
        phone: user.phone || '',
      });
    }
  }, [user, form]);

  async function onSubmit(data: ProfileFormValues) {
    if (!user) return;
    
    setIsSaving(true);
    try {
      unwrap(await api.api.v1.users.me.put({
        username: data.username,
        phone: data.phone || undefined,
      }));
      
      toast.success('Profile updated successfully');
      
      // Refresh the user context to reflect changes everywhere
      await refreshUser();
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate size (e.g., 5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const response = await api.api.v1.users.me.avatar.put({
        avatar: file
      });
      
      unwrap(response);
      toast.success('Profile picture updated');
      await refreshUser();
    } catch (error: any) {
      console.error('Failed to upload avatar:', error);
      toast.error(error.message || 'Failed to upload profile picture');
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader 
        title="Profile Settings" 
        description="Manage your account details and preferences."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Read-only Information */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-[#E5E7EB] shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-[#111827]">Account Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4 pb-4 border-b border-[#E5E7EB]">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                    <AvatarImage 
                      src={user?.avatar_url ? (user.avatar_url.startsWith('http') ? user.avatar_url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/uploads/${user.avatar_url}`) : ''} 
                      alt={user?.username} 
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-[#2563EB]/10 text-[#2563EB] text-2xl font-bold">
                      {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <button
                    type="button"
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 p-1.5 bg-[#2563EB] text-white rounded-full shadow-sm hover:bg-[#1D4ED8] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563EB] disabled:opacity-50"
                    title="Change Profile Picture"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Pencil className="h-4 w-4" />
                    )}
                  </button>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/png, image/jpeg, image/webp" 
                    onChange={handleAvatarUpload}
                    disabled={isUploading}
                  />
                </div>
                
                <div className="text-center">
                  <h3 className="font-bold text-[#111827] text-lg">{user?.username}</h3>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="h-4 w-4 text-[#6B7280]" />
                  <div>
                    <p className="font-medium text-[#111827]">Email</p>
                    <p className="text-[#6B7280]">{user?.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Editable Profile Form */}
        <div className="md:col-span-2">
          <Card className="border-[#E5E7EB] shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#111827]">Personal Details</CardTitle>
              <CardDescription>
                Update your personal information. Changes will be reflected across the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#111827] font-medium">Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <UserCircle className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
                            <Input 
                              placeholder="Your full name or username" 
                              className="pl-9 border-[#D1D5DB] focus:border-[#2563EB] focus:ring-[#2563EB]" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          This is your public display name.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#111827] font-medium">Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
                            <Input 
                              placeholder="+1 (555) 000-0000" 
                              className="pl-9 border-[#D1D5DB] focus:border-[#2563EB] focus:ring-[#2563EB]" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Used for important account notifications and emergency contact.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end pt-4 border-t border-[#E5E7EB]">
                    <Button 
                      type="submit" 
                      disabled={isSaving || !form.formState.isDirty}
                      className="bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
