import { useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useApp } from '../store/AppContext';

export function useAuth() {
  const { setUser } = useApp();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        signInAnonymously(auth).catch((err) => {
          console.error('Anonymous sign-in failed:', err);
        });
      }
    });

    return () => unsubscribe();
  }, []);
}
