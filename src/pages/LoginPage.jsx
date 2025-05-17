
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, ShieldCheck, Trophy } from 'lucide-react';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth(); // Use isLoading from context
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Navigation is handled by onAuthStateChange in AuthContext
    } catch (error) {
      // Error toast is handled in AuthContext or login function
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-dark-bg via-purple-900 to-brand-dark-bg p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <Card className="w-full max-w-md shadow-2xl bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
             <div className="flex justify-center items-center mb-4">
                <Trophy className="w-16 h-16 text-brand-purple"/>
             </div>
            <CardTitle className="text-3xl font-bold text-brand-text-primary">Bem-vindo ao Patotas!</CardTitle>
            <CardDescription className="text-brand-text-secondary">Faça login para gerenciar suas equipes.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-brand-text-secondary">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background/50 border-border focus:border-brand-purple"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-brand-text-secondary">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background/50 border-border focus:border-brand-purple"
                />
              </div>
              <Button type="submit" className="w-full gradient-button font-semibold" disabled={isLoading}>
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                ) : (
                  <LogIn className="mr-2 h-5 w-5" />
                )}
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-2">
            {/* Replace with RegisterPage link once created */}
            <Link to="/register" className="text-sm text-brand-purple hover:underline"> 
              Não tem uma conta? Registre-se
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

export default LoginPage;
