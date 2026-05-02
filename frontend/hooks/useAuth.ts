import { useAuthStore } from '@/store/authStore';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, isInitialized, login, signup, logout, updateProfile, forgotPassword, resetPassword, uploadCV, getCV, deleteCV, createAdmin, uploadProfilePicture, deleteProfilePicture } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    login,
    signup,
    logout,
    updateProfile,
  };
};
