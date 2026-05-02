import { useLoadingStore } from '@/store/loadingStore';

export const useLoader = () => {
  const { isLoading, setLoading } = useLoadingStore();

  const withLoader = async <T>(callback: () => Promise<T>): Promise<T> => {
    try {
      setLoading(true);
      return await callback();
    } finally {
      setLoading(false);
    }
  };

  return {
    isLoading,
    setLoading,
    withLoader,
  };
};

// Export standalone helper for use outside components
export const withLoader = async <T>(
  callback: () => Promise<T>,
  setLoading: (loading: boolean) => void
): Promise<T> => {
  try {
    setLoading(true);
    return await callback();
  } finally {
    setLoading(false);
  }
};
