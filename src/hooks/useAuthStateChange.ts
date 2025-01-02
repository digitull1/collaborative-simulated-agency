import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuthStateChange = () => {
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Supabase auth event:', event);
      if (session) {
        console.log('Session exists:', !!session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
};