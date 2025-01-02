import { createContext, useContext, useEffect, useState } from 'react';
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

    const handleAuthError = async (error: any) => {
      if (!mounted) return;
      
      console.error('Auth error:', error);
      
      // Clear session data
      setSession(null);
      setUser(null);
      
      try {
        // Sign out from Supabase
        await supabase.auth.signOut();
        
        // Redirect to login
        navigate('/login');
        
        // Show error toast
        toast({
          title: "Authentication Error",
          description: "Please sign in again to continue.",
          variant: "destructive",
        });
      } catch (signOutError) {
        console.error('Error during sign out:', signOutError);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      
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
            if (newSession) {
              setSession(newSession);
              setUser(newSession.user);
            }
            break;
            
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
        console.error('Error handling auth state change:', error);
        await handleAuthError(error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return (
    <AuthContext.Provider value={{ session, user, loading }}>
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