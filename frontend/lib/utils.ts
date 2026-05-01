import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ApplicationStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getStatusColor = (status: ApplicationStatus): string => {
  const colors: Record<ApplicationStatus, string> = {
    Applied: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    Pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    Interview: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
    Accepted: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    Rejected: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  }
  return colors[status]
}

export const getPriorityColor = (priority?: string): string => {
  const colors: Record<string, string> = {
    low: 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200',
    medium: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    high: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  }
  return colors[priority || 'medium']
}
