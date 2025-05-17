
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { PlusCircle, Loader2 } from 'lucide-react';

function CreatePatotaPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ variant: "destructive", title: "Erro", description: "Você precisa estar logado para criar uma patota." });
      return;
    }
    if (!name.trim()) {
      toast({ variant: "destructive", title: "Erro", description: "O nome da patota não pode estar vazio." });
      return;
    }

    setIsLoading(true);

    try {
      const { data: patotaData, error: patotaError } = await supabase
        .from('patotas')
        .insert([{ 
            name, 
            description, 
            created_by: user.id 
        }])
        .select()
        .single();

      if (patotaError) throw patotaError;

      toast({
        title: "Patota Criada!",
        description: `${name} foi criada com sucesso. Código de convite: ${patotaData.invite_code}`,
      });
      navigate(`/patota/${patotaData.id}`);

    } catch (error) {
      console.error('Error creating patota:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar patota",
        description: error.message || "Ocorreu um problema ao tentar criar a patota.",
      });
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
        <Card className="max-w-2xl mx-auto shadow-2xl bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-brand-purple">Criar Nova Patota</CardTitle>
            <CardDescription className="text-brand-text-secondary">
              Preencha os detalhes abaixo para criar sua nova patota.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="patotaName" className="text-brand-text-secondary">Nome da Patota</Label>
                <Input
                  id="patotaName"
                  type="text"
                  placeholder="Ex: Guerreiros da Madrugada"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-background/50 border-border focus:border-brand-purple"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patotaDescription" className="text-brand-text-secondary">Descrição (Opcional)</Label>
                <Textarea
                  id="patotaDescription"
                  placeholder="Ex: Time de futebol semanal, toda quinta às 20h."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-background/50 border-border focus:border-brand-purple min-h-[100px]"
                />
              </div>
              <Button type="submit" className="w-full gradient-button font-semibold" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Criar Patota
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-brand-text-secondary text-center w-full">
              Após criar, você receberá um código de convite para compartilhar com os membros.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

export default CreatePatotaPage;
