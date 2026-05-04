'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApplicationSchema, ApplicationFormData } from '@/lib/validators';
import { useApplicationStore } from '@/store/applicationStore';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';

interface AddApplicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddApplicationModal({ open, onOpenChange }: AddApplicationModalProps) {
  const { user } = useAuth();
  const { addApplication, fetchApplications } = useApplicationStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(ApplicationSchema),
    defaultValues: {
      company: '',
      position: '',
      url: '',
      dateApplied: new Date().toISOString().split('T')[0],
      note: '',
      status: 'applied',
    },
  });

  const onSubmit = async (data: ApplicationFormData) => {
    if (!user) return;

    console.log('[ADD_APPLICATION_MODAL] Submitting application...');
    setIsSubmitting(true);
    try {
      const applicationData: any = {
        companyName: data.company,
        position: data.position,
        dateApplied: data.dateApplied,
        status: data.status,
      };

      if (data.url) {
        applicationData.jobUrl = data.url;
      }

      if (data.note) {
        applicationData.note = data.note;
      }

      console.log('[ADD_APPLICATION_MODAL] Calling addApplication with data=', applicationData);
      await addApplication(applicationData);

      console.log('[ADD_APPLICATION_MODAL] Refetching applications to sync state...');
      await fetchApplications();

      toast.success('Application added successfully!');
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error('[ADD_APPLICATION_MODAL] Error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to add application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">Add New Application</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Fill in the details of your job application.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-900 dark:text-white">Company Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Google"
                      className="border-slate-200 dark:border-white/[0.10] bg-white dark:bg-white/[0.05] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-[#2563EB]/40 focus:border-[#2563EB]/40"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-900 dark:text-white">Position</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Senior Software Engineer"
                      className="border-slate-200 dark:border-white/[0.10] bg-white dark:bg-white/[0.05] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-[#2563EB]/40 focus:border-[#2563EB]/40"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-900 dark:text-white">Job URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://careers.google.com/..."
                      type="url"
                      className="border-slate-200 dark:border-white/[0.10] bg-white dark:bg-white/[0.05] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-[#2563EB]/40 focus:border-[#2563EB]/40"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateApplied"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-900 dark:text-white">Date Applied</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="border-slate-200 dark:border-white/[0.10] bg-white dark:bg-white/[0.05] text-slate-900 dark:text-white focus:ring-[#2563EB]/40 focus:border-[#2563EB]/40"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-900 dark:text-white">Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-slate-200 dark:border-white/[0.10] bg-white dark:bg-white/[0.05] text-slate-900 dark:text-white focus:ring-[#2563EB]/40 focus:border-[#2563EB]/40">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="border-slate-200 dark:border-white/[0.10] bg-white dark:bg-slate-900">
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-900 dark:text-white">Note (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about this application..."
                      className="min-h-20 border-slate-200 dark:border-white/[0.10] bg-white dark:bg-white/[0.05] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-[#2563EB]/40 focus:border-[#2563EB]/40"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.04]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:shadow-lg hover:shadow-[#2563EB]/25 hover:-translate-y-0.5 transition-all duration-300"
              >
                {isSubmitting ? 'Adding...' : 'Add Application'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
