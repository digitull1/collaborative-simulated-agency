import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuthError = useCallback(async (error: any) => {
    console.error('Auth error:', error);
    
    setSession(null);
    setUser(null);
    
    try {
      await supabase.auth.signOut();
      navigate('/login');
      
      toast({
        title: "Authentication Error",
        description: "Please sign in again to continue.",
        variant: "destructive",
      });
    } catch (signOutError) {
      console.error('Error during sign out:', signOutError);
    }
  }, [navigate, toast]);

  const handleAuthStateChange = useCallback(async (event: string, newSession: Session | null) => {
    console.log('Auth state change:', event);
    
    try {
      switch (event) {
        case 'SIGNED_IN':
          if (newSession) {
            setSession(newSession);
            setUser(newSession.user);
          }
          break;
          
        case 'SIGNED_OUT':
          setSession(null);
          setUser(null);
          navigate('/login');
          toast({
            title: "Signed Out",
            description: "You have been signed out successfully.",
          });
          break;
          
        case 'TOKEN_REFRESHED':
        case 'USER_UPDATED':
          if (newSession) {
            setSession(newSession);
            setUser(newSession.user);
          }
          break;
          
        default:
          if (!newSession) {
            setSession(null);
            setUser(null);
          }
      }
    } catch (error) {
      await handleAuthError(error);
    }
  }, [navigate, toast, handleAuthError]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth initialization error:', error);
          await handleAuthError(error);
          return;
        }

        if (initialSession && mounted) {
          setSession(initialSession);
          setUser(initialSession.user);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        await handleAuthError(error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [handleAuthStateChange, handleAuthError]);

  const contextValue = {
    session,
    user,
    loading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};