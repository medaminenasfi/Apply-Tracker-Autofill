'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProfileSchema, ProfileFormData } from '@/lib/validators';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Upload, FileText, Eye, Trash2, User, FileText as FileIcon, Camera, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import api from '@/services/api';

export function ProfileForm() {
  const { user, updateProfile, uploadCV, deleteCV, getCV, uploadProfilePicture, deleteProfilePicture, isLoading } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const [isDeletingCV, setIsDeletingCV] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [cvInfo, setCvInfo] = useState<{ hasCV: boolean; cvUrl: string | null; filename: string | null; fileSize?: string; uploadedAt?: string } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [isUploadingProfilePicture, setIsUploadingProfilePicture] = useState(false);
  const [isDeletingProfilePicture, setIsDeletingProfilePicture] = useState(false);
  const [showProfilePictureDeleteDialog, setShowProfilePictureDeleteDialog] = useState(false);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);

  // Fetch CV info on component mount and when user changes
  useEffect(() => {
    const fetchCVInfo = async () => {
      try {
        const info = await getCV();
        setCvInfo(info);
      } catch (error) {
        console.error('Failed to fetch CV info:', error);
      }
    };
    fetchCVInfo();
  }, [getCV, user]);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      countryCode: user?.countryCode || '+216',
      university: user?.university || '',
      linkedin: user?.linkedin || '',
      portfolio: user?.portfolio || '',
    },
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        countryCode: user.countryCode || '+216',
        university: user.university || '',
        linkedin: user.linkedin || '',
        portfolio: user.portfolio || '',
      });
    }
  }, [user, form]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      await updateProfile(data);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Profile update error:', error);
      const errorMessage = error.message || 'Failed to update profile';
      toast.error(errorMessage);
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
      await uploadCV(cvFile);
      toast.success('CV uploaded successfully!');
      setCvFile(null);
      
      // Refresh CV info
      const info = await getCV();
      setCvInfo(info);
    } catch (error: any) {
      console.error('Failed to upload CV:', error);
      const errorMessage = error.message || 'Failed to upload CV';
      toast.error(errorMessage);
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
    } catch (error: any) {
      console.error('Failed to delete CV:', error);
      const errorMessage = error.message || 'Failed to delete CV';
      toast.error(errorMessage);
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const filename = cvInfo.filename;
      const previewUrl = `${apiUrl}/profile/cv/public-preview/${filename}`;
      
      window.open(previewUrl, '_blank');
    } catch (error) {
      console.error('Failed to preview CV:', error);
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
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    if (!first && !last) return '?';
    return `${first}${last}`.toUpperCase();
  };

  const handleProfilePictureUpload = async (file: File) => {
    if (!file) {
      toast.error('Please select a profile picture');
      return;
    }

    setIsUploadingProfilePicture(true);
    try {
      await uploadProfilePicture(file);
      toast.success('Profile picture uploaded successfully!');
      setProfilePictureFile(null);
    } catch (error: any) {
      console.error('Failed to upload profile picture:', error);
      const errorMessage = error.message || 'Failed to upload profile picture';
      toast.error(errorMessage);
    } finally {
      setIsUploadingProfilePicture(false);
    }
  };

  const handleDeleteProfilePicture = async () => {
    setIsDeletingProfilePicture(true);
    try {
      await deleteProfilePicture();
      toast.success('Profile picture deleted successfully!');
      setShowProfilePictureDeleteDialog(false);
    } catch (error: any) {
      console.error('Failed to delete profile picture:', error);
      const errorMessage = error.message || 'Failed to delete profile picture';
      toast.error(errorMessage);
    } finally {
      setIsDeletingProfilePicture(false);
    }
  };

  // Calculate profile completion
  const calculateCompletion = () => {
    if (!user) return 0;
    let completed = 0;
    let total = 8;
    
    if (user.firstName) completed++;
    if (user.lastName) completed++;
    if (user.phone || user.countryCode) completed++;
    if (cvInfo?.hasCV) completed++;
    if (user.linkedin) completed++;
    if (user.portfolio) completed++;
    if (user.university) completed++;
    if (user.email) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const completionPercentage = calculateCompletion();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-4 space-y-6">
        {/* Profile Picture Card */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B1220] shadow-[0_4px_16px_rgba(15,23,42,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Profile Picture</h2>
          </div>
          
          <div 
            className="relative w-32 h-32 mx-auto mb-4 group cursor-pointer"
            onMouseEnter={() => setIsHoveringAvatar(true)}
            onMouseLeave={() => setIsHoveringAvatar(false)}
            onClick={() => document.getElementById('profile-picture-input')?.click()}
          >
            <Avatar className="w-full h-full">
              {user?.profilePictureUrl ? (
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${user.profilePictureUrl}`} 
                  alt="Profile" 
                  className="h-full w-full object-cover"
                />
              ) : (
                <AvatarFallback className="text-3xl font-semibold bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white">
                  {getInitials()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className={`absolute inset-0 rounded-full bg-black/50 flex items-center justify-center transition-opacity ${isHoveringAvatar ? 'opacity-100' : 'opacity-0'}`}>
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => document.getElementById('profile-picture-input')?.click()}
              className="border-slate-200 dark:border-white/[0.10] hover:bg-slate-50 dark:hover:bg-white/[0.05]"
            >
              <Upload className="h-4 w-4 mr-2" />
              Change
            </Button>
            {user?.profilePictureUrl && (
              <Button 
                variant="outline"
                onClick={() => setShowProfilePictureDeleteDialog(true)}
                disabled={isDeletingProfilePicture}
                className="border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
          <input
            id="profile-picture-input"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (file.size > 5 * 1024 * 1024) {
                  toast.error('File size must be less than 5MB');
                  return;
                }
                setProfilePictureFile(file);
                handleProfilePictureUpload(file);
              }
            }}
          />
        </div>

        {/* Profile Completion Card */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B1220] shadow-[0_4px_16px_rgba(15,23,42,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Profile Completion</h2>
          </div>
          
          <div className="text-center mb-4">
            <p className="text-4xl font-bold text-slate-900 dark:text-white mb-1">{completionPercentage}%</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Complete</p>
          </div>
          
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/[0.10] overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#2563EB] to-[#7C3AED] transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center">
            {completionPercentage < 100 ? 'Complete your profile to get better results' : 'Great job! Your profile is complete'}
          </p>
        </div>

        {/* Resume/CV Card */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B1220] shadow-[0_4px_16px_rgba(15,23,42,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-3 mb-4">
            <FileIcon className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Resume/CV</h2>
          </div>

          {cvInfo?.hasCV ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03]">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-xl bg-[#2563EB]/10 dark:bg-[#2563EB]/15 flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6 text-[#2563EB]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">{cvInfo.filename}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">PDF Document</p>
                    {cvInfo.fileSize && (
                      <p className="text-xs text-slate-400 dark:text-slate-500">{cvInfo.fileSize}</p>
                    )}
                    {cvInfo.uploadedAt && (
                      <p className="text-xs text-slate-400 dark:text-slate-500">{cvInfo.uploadedAt}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviewCV}
                  className="flex-1 border-slate-200 dark:border-white/[0.10] hover:bg-slate-50 dark:hover:bg-white/[0.05]"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('cv-input')?.click()}
                  className="flex-1 border-slate-200 dark:border-white/[0.10] hover:bg-slate-50 dark:hover:bg-white/[0.05]"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Replace
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isDeletingCV}
                  className="border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-slate-300 dark:border-white/[0.12] rounded-xl p-6 text-center cursor-pointer hover:border-[#2563EB] dark:hover:border-[#2563EB]/50 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all"
                onClick={() => document.getElementById('cv-input')?.click()}
              >
                <FileText className="h-10 w-10 mx-auto text-slate-400 dark:text-slate-500 mb-3" />
                <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">Upload your CV</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">PDF only, max 5MB</p>
              </div>
            </div>
          )}
          
          <Input
            id="cv-input"
            type="file"
            accept=".pdf"
            onChange={(e) => setCvFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          
          {cvFile && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08]">
              <FileText className="h-5 w-5 text-slate-400" />
              <span className="text-sm flex-1 truncate text-slate-900 dark:text-white">{cvFile.name}</span>
              <Button
                onClick={handleCVUpload}
                disabled={isUploadingCV || isLoading}
                size="sm"
                className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:shadow-lg hover:shadow-[#2563EB]/25"
              >
                {isUploadingCV ? 'Uploading...' : 'Upload'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCvFile(null)}
                disabled={isUploadingCV}
                className="border-slate-200 dark:border-white/[0.10] hover:bg-slate-50 dark:hover:bg-white/[0.05]"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Profile Information Form */}
      <div className="lg:col-span-8">
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B1220] shadow-[0_4px_16px_rgba(15,23,42,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Profile Information</h2>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} className="border-slate-200 dark:border-white/[0.10] bg-white dark:bg-white/[0.04]" />
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
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} className="border-slate-200 dark:border-white/[0.10] bg-white dark:bg-white/[0.04]" />
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
                    <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" type="email" disabled {...field} className="border-slate-200 dark:border-white/[0.10] bg-white dark:bg-white/[0.04] opacity-50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <FormField
                  control={form.control}
                  name="countryCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Country Code</FormLabel>
                      <FormControl>
                        <Input placeholder="+216" type="text" {...field} className="border-slate-200 dark:border-white/[0.10] bg-white dark:bg-white/[0.04]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="md:col-span-3">
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678" type="tel" {...field} className="border-slate-200 dark:border-white/[0.10] bg-white dark:bg-white/[0.04]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="university"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">University (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="MIT" {...field} className="border-slate-200 dark:border-white/[0.10] bg-white dark:bg-white/[0.04]" />
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
                    <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">LinkedIn Profile (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://linkedin.com/in/..."
                        type="url"
                        {...field}
                        className="border-slate-200 dark:border-white/[0.10] bg-white dark:bg-white/[0.04]"
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
                    <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Portfolio Website (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com"
                        type="url"
                        {...field}
                        className="border-slate-200 dark:border-white/[0.10] bg-white dark:bg-white/[0.04]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 border-t border-slate-200 dark:border-white/[0.08]">
                <Button 
                  type="submit" 
                  disabled={isSaving || isLoading}
                  className="w-full bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:shadow-lg hover:shadow-[#2563EB]/25 hover:-translate-y-0.5 transition-all duration-300"
                >
                  {isSaving || isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="rounded-2xl border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B1220]">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">Delete CV</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Are you sure you want to delete your CV? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="border-slate-200 dark:border-white/[0.10] hover:bg-slate-50 dark:hover:bg-white/[0.05]"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteCV}
              disabled={isDeletingCV}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Picture Delete Confirmation Dialog */}
      <Dialog open={showProfilePictureDeleteDialog} onOpenChange={setShowProfilePictureDeleteDialog}>
        <DialogContent className="rounded-2xl border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B1220]">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">Delete Profile Picture</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Are you sure you want to delete your profile picture? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProfilePictureDeleteDialog(false)} className="border-slate-200 dark:border-white/[0.10] hover:bg-slate-50 dark:hover:bg-white/[0.05]">
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteProfilePicture}
              disabled={isDeletingProfilePicture}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CV Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={handleClosePreview}>
        <DialogContent className="max-w-4xl h-[80vh] rounded-2xl border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B1220]">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">CV Preview</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Preview your uploaded CV
            </DialogDescription>
          </DialogHeader>
          {previewUrl && (
            <iframe 
              src={previewUrl} 
              className="w-full h-[calc(80vh-8rem)] border border-slate-200 dark:border-white/[0.08] rounded-xl"
              title="CV Preview"
            />
          )}
          <DialogFooter>
            <Button onClick={handleClosePreview} className="border-slate-200 dark:border-white/[0.10] hover:bg-slate-50 dark:hover:bg-white/[0.05]">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
