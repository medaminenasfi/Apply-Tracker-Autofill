'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps, toast as sonnerToast } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        duration: 3000,
        classNames: {
          toast: 'applyflow-toast',
          description: 'applyflow-toast-description',
          title: 'applyflow-toast-title',
          success: 'applyflow-toast-success',
          error: 'applyflow-toast-error',
          warning: 'applyflow-toast-warning',
          info: 'applyflow-toast-info',
        },
      }}
      {...props}
    />
  )
}

export { Toaster, sonnerToast as toast }
