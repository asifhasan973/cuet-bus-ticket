import { useEffect, useRef } from 'react';
import { getRedirectResult, signInWithRedirect, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { isAllowedInstitutionEmail, ALLOWED_EMAIL_MESSAGE } from '../utils/emailDomain';
import toast from 'react-hot-toast';

/**
 * Hook to handle Google Auth via signInWithRedirect.
 * This avoids the Cross-Origin-Opener-Policy (COOP) issue
 * that breaks signInWithPopup in modern Chrome.
 *
 * @param {string} role - 'student' or 'supervisor'
 * @param {function} onSuccess - callback with (user) on successful login
 */
export const useGoogleAuth = (role, onSuccess) => {
  const { googleLogin } = useAuth();
  const processingRef = useRef(false);

  // On mount, check if we're returning from a Google redirect
  useEffect(() => {
    const handleRedirectResult = async () => {
      // Prevent double-processing
      if (processingRef.current) return;

      // Check if we initiated a Google redirect from this page
      const pendingRole = sessionStorage.getItem('google_auth_pending_role');
      if (!pendingRole) return;

      processingRef.current = true;

      try {
        const result = await getRedirectResult(auth);
        if (!result) {
          // No redirect result — user may have cancelled or not redirected
          processingRef.current = false;
          return;
        }

        const userEmail = result.user.email;

        if (!isAllowedInstitutionEmail(userEmail)) {
          await signOut(auth);
          toast.error(ALLOWED_EMAIL_MESSAGE);
          sessionStorage.removeItem('google_auth_pending_role');
          processingRef.current = false;
          return;
        }

        const credential = await result.user.getIdToken();
        const user = await googleLogin(credential, pendingRole);

        sessionStorage.removeItem('google_auth_pending_role');
        onSuccess(user);
      } catch (error) {
        console.error('[GOOGLE AUTH] Redirect result error:', error);
        toast.error(error.response?.data?.message || 'Google login failed');
        sessionStorage.removeItem('google_auth_pending_role');
      } finally {
        processingRef.current = false;
      }
    };

    handleRedirectResult();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startGoogleSignIn = () => {
    // Store which role initiated the redirect so we can use it on return
    sessionStorage.setItem('google_auth_pending_role', role);
    signInWithRedirect(auth, googleProvider);
  };

  // Check if we're currently processing a redirect return
  const isProcessingRedirect = !!sessionStorage.getItem('google_auth_pending_role');

  return { startGoogleSignIn, isProcessingRedirect };
};
