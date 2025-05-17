
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        if (event === 'SIGNED_IN') {
          navigate('/dashboard');
        }
        if (event === 'SIGNED_OUT') {
          navigate('/login');
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [navigate]);

  const login = async (email, password) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({ variant: "destructive", title: "Falha no login", description: error.message || "E-mail ou senha inválidos." });
      setLoading(false);
      throw error;
    }
    
    if (data.user) {
        toast({ title: "Login bem-sucedido!", description: "Bem-vindo de volta!" });
    }
    setLoading(false);
    return data.user;
  };

  const register = async (email, password, fullName) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      toast({ variant: "destructive", title: "Falha no registro", description: error.message });
      setLoading(false);
      throw error;
    }
    
    if (data.user) {
        toast({ title: "Registro bem-sucedido!", description: "Por favor, verifique seu e-mail para confirmação." });
    }
    setLoading(false);
    return data.user;
  };


  const logout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ variant: "destructive", title: "Erro ao sair", description: error.message });
      setLoading(false);
      throw error;
    }
    toast({ title: "Logout realizado", description: "Até logo!" });
    setUser(null);
    setLoading(false);
  };

  const value = { 
    user, 
    login, 
    logout, 
    register,
    isAuthenticated: !!user, 
    isLoading: loading 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
