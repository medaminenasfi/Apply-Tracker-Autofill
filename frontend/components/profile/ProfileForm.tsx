'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProfileSchema, ProfileFormData } from '@/lib/validators';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Upload, FileText, Eye, Trash2, AlertCircle } from 'lucide-react';
import api from '@/services/api';

export function ProfileForm() {
  const { user, updateProfile, uploadCV, deleteCV, getCV, isLoading, token } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const [isDeletingCV, setIsDeletingCV] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [cvInfo, setCvInfo] = useState<{ hasCV: boolean; cvUrl: string | null; filename: string | null } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fetch CV info on component mount and when user changes
  useEffect(() => {
    const fetchCVInfo = async () => {
      try {
        console.log('Fetching CV info on mount...');
        const info = await getCV();
        console.log('CV info on mount:', info);
        setCvInfo(info);
      } catch (error) {
        console.error('Failed to fetch CV info:', error);
      }
    };
    fetchCVInfo();
  }, [user]);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      university: user?.university || '',
      linkedin: user?.linkedin || '',
      portfolio: user?.portfolio || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      await updateProfile(data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCVUpload = async () => {
    if (!cvFile) {
      toast.error('Please select a CV file');
      return;
    }

    setIsUploadingCV(true);
    try {
      console.log('Uploading CV file:', cvFile.name);
      await uploadCV(cvFile);
      toast.success('CV uploaded successfully!');
      setCvFile(null);
      
      // Refresh CV info
      console.log('Fetching CV info after upload...');
      const info = await getCV();
      console.log('CV info after upload:', info);
      setCvInfo(info);
    } catch (error) {
      console.error('Failed to upload CV:', error);
      toast.error('Failed to upload CV');
    } finally {
      setIsUploadingCV(false);
    }
  };

  const handleDeleteCV = async () => {
    setIsDeletingCV(true);
    try {
      await deleteCV();
      toast.success('CV deleted successfully!');
      setShowDeleteDialog(false);
      
      // Refresh CV info
      const info = await getCV();
      setCvInfo(info);
    } catch (error) {
      toast.error('Failed to delete CV');
    } finally {
      setIsDeletingCV(false);
    }
  };

  const handlePreviewCV = async () => {
    if (!cvInfo?.cvUrl) {
      toast.error('No CV to preview');
      return;
    }

    try {
      console.log('[CV Preview] Opening CV in new tab...');
      
      // Open the CV URL directly in a new tab (bypasses CORS)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const filename = cvInfo.filename;
      const previewUrl = `${apiUrl}/profile/cv/public-preview/${filename}`;
      
      console.log('[CV Preview] Preview URL:', previewUrl);
      window.open(previewUrl, '_blank');
      
      console.log('[CV Preview] CV opened in new tab');
    } catch (error) {
      console.error('[CV Preview] Error:', error);
      toast.error(`Failed to preview CV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleClosePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setPreviewOpen(false);
  };

  const getInitials = () => {
    if (!user) return '?';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Update your profile picture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-xl font-semibold bg-primary text-primary-foreground">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline">Upload Picture</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resume/CV</CardTitle>
          <CardDescription>Upload your resume or CV (PDF only, max 5MB)</CardDescription>
        </CardHeader>
        <CardContent>
          {cvInfo?.hasCV ? (
            // Current CV card - shows when user has a CV
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{cvInfo.filename}</p>
                  <p className="text-sm text-muted-foreground">PDF Document</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviewCV}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('cv-input')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Replace
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isDeletingCV}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Upload card - shows when user has no CV
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 border-2 border-dashed rounded-lg">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">No CV uploaded</p>
                  <p className="text-xs text-muted-foreground">Upload your resume to get started</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Hidden file input */}
          <Input
            id="cv-input"
            type="file"
            accept=".pdf"
            onChange={(e) => setCvFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          
          {/* Upload section when file is selected */}
          {cvFile && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm flex-1 truncate">{cvFile.name}</span>
              <Button
                onClick={handleCVUpload}
                disabled={isUploadingCV || isLoading}
                size="sm"
              >
                {isUploadingCV ? 'Uploading...' : 'Upload CV'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCvFile(null)}
                disabled={isUploadingCV}
              >
                Cancel
              </Button>
            </div>
          )}
          
          {/* Show upload button only when no CV and no file selected */}
          {!cvInfo?.hasCV && !cvFile && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => document.getElementById('cv-input')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload CV
            </Button>
          )}
          
          {/* Debug: Show CV info state */}
          <div className="text-xs text-muted-foreground mt-2">
            CV Info: {JSON.stringify(cvInfo)}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete CV</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your CV? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeletingCV}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCV}
              disabled={isDeletingCV}
            >
              {isDeletingCV ? 'Deleting...' : 'Delete CV'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CV Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={handleClosePreview}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>CV Preview</DialogTitle>
            <DialogDescription>
              Preview your uploaded CV
            </DialogDescription>
          </DialogHeader>
          {previewUrl && (
            <iframe 
              src={previewUrl} 
              className="w-full h-[calc(80vh-8rem)] border rounded-lg"
              title="CV Preview"
            />
          )}
          <DialogFooter>
            <Button onClick={handleClosePreview}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" type="email" disabled {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+1-555-0000" type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="university"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>University (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="MIT" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn Profile (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://linkedin.com/in/..."
                        type="url"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="portfolio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portfolio Website (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com"
                        type="url"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSaving || isLoading}>
                {isSaving || isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
