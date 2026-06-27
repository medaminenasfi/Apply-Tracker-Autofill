'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApplicationEditSchema, ApplicationEditFormData } from '@/lib/validators';
import { useApplicationStore } from '@/store/applicationStore';
import { Application } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface EditApplicationModalProps {
  application: Application | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toDateInput(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

export function EditApplicationModal({ application, open, onOpenChange }: EditApplicationModalProps) {
  const { updateApplication, moveApplication } = useApplicationStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ApplicationEditFormData>({
    resolver: zodResolver(ApplicationEditSchema),
    defaultValues: {
      company: '',
      position: '',
      url: '',
      dateApplied: '',
      deadline: '',
      status: 'applied',
      cvUsed: '',
    },
  });

  useEffect(() => {
    if (!application || !open) return;
    form.reset({
      company: application.companyName,
      position: application.position,
      url: application.jobUrl || '',
      dateApplied: toDateInput(application.dateApplied),
      deadline: toDateInput(application.deadline),
      status: application.status,
      cvUsed: application.cvUsed || '',
    });
  }, [application, open, form]);

  const onSubmit = async (data: ApplicationEditFormData) => {
    if (!application) return;

    setIsSubmitting(true);
    try {
      const payload = {
        companyName: data.company,
        position: data.position,
        jobUrl: data.url,
        dateApplied: data.dateApplied,
        deadline: data.deadline || '',
        cvUsed: data.cvUsed || '',
      };

      await updateApplication(application._id, payload);

      if (data.status !== application.status) {
        await moveApplication(application._id, data.status);
      }

      toast.success('Application updated successfully!');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to update application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">Edit Application</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Update application details. Notes are managed separately on the card.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Google" {...field} />
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
                  <FormLabel>Job Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Senior Software Engineer" {...field} />
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
                  <FormLabel>Job Link *</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="dateApplied"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Applied *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cvUsed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CV Used (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Software-Eng-CV.pdf" {...field} />
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
                  <FormLabel>Status *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
