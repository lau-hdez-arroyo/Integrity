import { createContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const AuthContext = createContext();

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      const authUser = session?.user ?? null;
      setUser(authUser);
      
      if (authUser) {
        // Extract role from user metadata
        const role = authUser.user_metadata?.role || 'user';
        setUserRole(role);
        localStorage.setItem('userRole', role);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const authUser = session?.user ?? null;
        setUser(authUser);
        
        if (authUser) {
          const role = authUser.user_metadata?.role || 'user';
          setUserRole(role);
          localStorage.setItem('userRole', role);
        } else {
          setUserRole(null);
          localStorage.removeItem('userRole');
        }
      },
    );

    return () => subscription?.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    
    // Extract and store role after login
    if (data.user) {
      const role = data.user.user_metadata?.role || 'user';
      setUserRole(role);
      localStorage.setItem('userRole', role);
    }
    
    return data;
  };

  const signup = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    setUserRole(null);
    localStorage.removeItem('userRole');
  };

  return (
    <AuthContext.Provider value={{ user, userRole, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
