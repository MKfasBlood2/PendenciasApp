
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { LogIn, Loader2, AlertTriangle } from 'lucide-react';

function JoinPatotaPage() {
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!user) {
      toast({ variant: "destructive", title: "Erro", description: "Você precisa estar logado para entrar em uma patota." });
      return;
    }
    
    const trimmedCode = inviteCode.trim();
    if (!trimmedCode) {
      toast({ variant: "destructive", title: "Erro", description: "O código de convite não pode estar vazio." });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Find patota by invite code (case-insensitive and trimmed)
      //    The RLS policy for 'patotas' MUST allow a user to see a patota row if its invite_code matches.
      const { data: patota, error: patotaError } = await supabase
        .from('patotas')
        .select('id, name, invite_code') // Select invite_code to be sure
        .eq('invite_code', trimmedCode.toUpperCase()) // Compare with uppercase in DB
        .maybeSingle(); // Use maybeSingle to handle 0 rows gracefully without error, then check data.

      if (patotaError) { // This catches actual DB errors, not "0 rows" with maybeSingle
        console.error("Supabase error fetching patota:", patotaError);
        throw patotaError;
      }

      if (!patota) {
        setError('Código de convite inválido ou patota não encontrada.');
        toast({ variant: "destructive", title: "Erro", description: "Código de convite inválido ou patota não encontrada." });
        setIsLoading(false);
        return;
      }

      // 2. Check if user is already a member
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('patota_members')
        .select('id')
        .eq('patota_id', patota.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (memberCheckError) throw memberCheckError;

      if (existingMember) {
        toast({ variant: "default", title: "Informação", description: `Você já é membro da patota "${patota.name}".` });
        navigate(`/patota/${patota.id}`);
        setIsLoading(false);
        return;
      }

      // 3. Add user to patota_members
      const { error: insertError } = await supabase
        .from('patota_members')
        .insert([{ patota_id: patota.id, user_id: user.id, role: 'Membro' }]);

      if (insertError) {
        if (insertError.message.includes('new row violates row-level security policy')) {
            setError("Não foi possível entrar na patota. Verifique as permissões ou contate o administrador.");
            toast({
                variant: "destructive",
                title: "Erro de Permissão",
                description: "Você não tem permissão para entrar nesta patota no momento.",
            });
        } else {
            console.error("Supabase error inserting member:", insertError);
            throw insertError;
        }
        setIsLoading(false);
        return;
      }

      toast({
        title: "Bem-vindo à Patota!",
        description: `Você entrou na patota "${patota.name}".`,
      });
      navigate(`/patota/${patota.id}`);

    } catch (err) {
      // Log the detailed error for debugging if it's not a toast-specific state
      if (!error && !toast.toasts.find(t => t.title === "Erro de Permissão" || t.title === "Erro")) {
         console.error('Error joining patota:', err);
      }
      
      // Set local error state if not already set by a specific condition
      if (!error) { 
        setError(err.message || "Ocorreu um problema ao tentar entrar na patota.");
      }
      // Show generic toast if no specific error toast was already shown
      if (!toast.toasts.find(t => t.title === "Erro de Permissão" || t.title === "Erro" || t.title === "Erro ao entrar na patota")) { 
        toast({
          variant: "destructive",
          title: "Erro ao entrar na patota",
          description: err.message || "Ocorreu um problema.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-lg mx-auto shadow-2xl bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-brand-purple">Entrar em uma Patota</CardTitle>
            <CardDescription className="text-brand-text-secondary">
              Insira o código de convite da patota que você deseja participar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="inviteCode" className="text-brand-text-secondary">Código de Convite</Label>
                <Input
                  id="inviteCode"
                  type="text"
                  placeholder="Ex: ABC123"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  required
                  className="bg-background/50 border-border focus:border-brand-purple"
                />
              </div>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center p-3 text-sm text-red-500 bg-red-500/10 rounded-md"
                >
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  {error}
                </motion.div>
              )}
              <Button type="submit" className="w-full gradient-button font-semibold" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Entrar na Patota
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-brand-text-secondary text-center w-full">
              O código de convite é fornecido pelo administrador da patota.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

export default JoinPatotaPage;
  