
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx";
import { Users, History, Shirt, PlusCircle, Loader2, ArrowLeft, Shield, UserCheck, Copy, Crown, ShieldCheck, User } from 'lucide-react';
import { motion } from 'framer-motion';

const MembrosList = ({ patotaId, userRole }) => {
  const [members, setMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const { toast } = useToast();

  const fetchMembers = useCallback(async () => {
    setIsLoadingMembers(true);
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('patota_members')
        .select(`
          user_id,
          role,
          score,
          users (
            raw_user_meta_data
          )
        `)
        .eq('patota_id', patotaId);

      if (memberError) throw memberError;

      const formattedMembers = memberData.map(m => ({
        id: m.user_id,
        fullName: m.users?.raw_user_meta_data?.full_name || 'Nome não disponível',
        role: m.role,
        score: m.score !== null ? m.score : 0,
      })).sort((a, b) => (b.score - a.score)); // Sort by score descending

      setMembers(formattedMembers);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar membros",
        description: error.message || "Não foi possível buscar os membros da patota.",
      });
    } finally {
      setIsLoadingMembers(false);
    }
  }, [patotaId, toast]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  if (isLoadingMembers) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  if (members.length === 0) {
    return <p className="text-brand-text-secondary text-center py-4">Nenhum membro encontrado nesta patota.</p>;
  }

  return (
    <div className="space-y-4">
      {members.map((member) => (
        <motion.div
          key={member.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between p-4 bg-background/50 rounded-lg shadow"
        >
          <div className="flex items-center">
            {member.role === 'Administrador' ? (
              <Crown className="h-6 w-6 mr-3 text-yellow-400" />
            ) : (
              <User className="h-6 w-6 mr-3 text-brand-text-secondary" />
            )}
            <div>
              <p className="font-semibold text-brand-text-primary">{member.fullName}</p>
              <p className="text-sm text-brand-text-secondary">{member.role}</p>
            </div>
          </div>
          <div className="text-right">
             <p className="text-lg font-bold text-brand-purple">{member.score}</p>
             <p className="text-xs text-brand-text-secondary">pontos</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const PartidasHistorico = ({ patotaId, userRole }) => <div className="py-4"><p className="text-brand-text-secondary">Histórico de Partidas (Em desenvolvimento)</p></div>;
const UniformeChecklist = ({ patotaId, userRole }) => <div className="py-4"><p className="text-brand-text-secondary">Controle de Uniformes (Em desenvolvimento)</p></div>;

const NovaPartidaModal = ({ patotaId, isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card text-card-foreground w-full max-w-md rounded-lg shadow-xl"
      >
        <CardHeader>
          <CardTitle className="text-brand-purple">Nova Partida</CardTitle>
          <CardDescription className="text-brand-text-secondary">Sorteio de times (Em desenvolvimento)</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-brand-text-primary">Funcionalidade de sorteio de times e registro de partida será implementada aqui.</p>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={onClose} variant="outline" className="border-brand-purple text-brand-purple hover:bg-brand-purple/10">Fechar</Button>
        </CardFooter>
      </motion.div>
    </motion.div>
  );
};


function PatotaPage() {
  const { patotaId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [patotaDetails, setPatotaDetails] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNovaPartidaModalOpen, setIsNovaPartidaModalOpen] = useState(false);
  
  useEffect(() => {
    const fetchPatotaDetails = async () => {
      if (!user || !patotaId) return;
      setIsLoading(true);
      try {
        const { data: patotaData, error: patotaError } = await supabase
          .from('patotas')
          .select('id, name, description, created_at, invite_code, created_by')
          .eq('id', patotaId)
          .single();

        if (patotaError) throw patotaError;
        if (!patotaData) {
          toast({ variant: "destructive", title: "Erro", description: "Patota não encontrada." });
          navigate('/dashboard');
          return;
        }
        
        const { data: memberData, error: memberError } = await supabase
          .from('patota_members')
          .select('role')
          .eq('patota_id', patotaId)
          .eq('user_id', user.id)
          .single();

        if (memberError && memberError.code !== 'PGRST116') { 
             throw memberError;
        }
        
        if (!memberData) {
            toast({ variant: "destructive", title: "Acesso Negado", description: "Você não é membro desta patota." });
            navigate('/dashboard');
            return;
        }

        setPatotaDetails(patotaData);
        setUserRole(memberData.role);

      } catch (error) {
        console.error('Error fetching patota details:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar patota",
          description: error.message || "Não foi possível carregar os detalhes da patota.",
        });
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatotaDetails();
  }, [patotaId, user, navigate, toast]);

  const handleCopyInviteCode = () => {
    if (patotaDetails?.invite_code) {
      navigator.clipboard.writeText(patotaDetails.invite_code)
        .then(() => {
          toast({ title: "Copiado!", description: "Código de convite copiado para a área de transferência." });
        })
        .catch(err => {
          toast({ variant: "destructive", title: "Erro", description: "Não foi possível copiar o código." });
          console.error('Failed to copy invite code: ', err);
        });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-brand-dark-bg">
        <Loader2 className="h-16 w-16 animate-spin text-brand-purple" />
      </div>
    );
  }

  if (!patotaDetails || !userRole) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-brand-dark-bg text-brand-text-primary p-4">
        <p className="text-xl mb-4">Não foi possível carregar os dados da patota.</p>
        <Button onClick={() => navigate('/dashboard')} variant="outline" className="border-brand-purple text-brand-purple hover:bg-brand-purple/10">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Dashboard
        </Button>
      </div>
    );
  }
  
  const isAdmin = userRole === 'Administrador';

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button onClick={() => navigate('/dashboard')} variant="outline" className="mb-6 border-brand-purple text-brand-purple hover:bg-brand-purple/10 hover:text-brand-purple">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Dashboard
        </Button>

        <Card className="mb-8 shadow-xl bg-card/80 backdrop-blur-sm border-brand-border">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <CardTitle className="text-4xl font-bold text-brand-purple mb-1">{patotaDetails.name}</CardTitle>
                    <CardDescription className="text-brand-text-secondary text-lg">{patotaDetails.description || "Nenhuma descrição fornecida."}</CardDescription>
                </div>
                <div className="mt-2 sm:mt-0 flex items-center text-sm text-brand-text-secondary bg-background/70 px-3 py-1.5 rounded-md border border-brand-border">
                    {isAdmin ? <ShieldCheck className="w-5 h-5 mr-2 text-brand-green" /> : <UserCheck className="w-5 h-5 mr-2 text-brand-text-secondary" />}
                    Você é: <span className={`font-semibold ml-1 ${isAdmin ? 'text-brand-green' : 'text-brand-text-primary'}`}>{userRole}</span>
                </div>
            </div>
            <div className="text-xs text-brand-text-secondary mt-2">
              Criada em: {new Date(patotaDetails.created_at).toLocaleDateString()}
            </div>
            {isAdmin && patotaDetails.invite_code && (
              <div className="mt-3 flex items-center">
                <span className="text-sm text-brand-text-secondary mr-2">Código de Convite:</span>
                <span className="font-mono bg-gray-700/50 text-gray-200 px-2 py-1 rounded text-sm border border-gray-600">{patotaDetails.invite_code}</span>
                <Button variant="ghost" size="sm" onClick={handleCopyInviteCode} className="ml-2 text-brand-purple hover:text-brand-purple/80">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardHeader>
        </Card>

        {isAdmin && (
          <motion.div className="mb-8" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={() => setIsNovaPartidaModalOpen(true)} className="w-full sm:w-auto gradient-button-green py-3 px-6 text-lg shadow-lg">
              <PlusCircle className="mr-2 h-6 w-6" /> Nova Partida
            </Button>
          </motion.div>
        )}

        <Tabs defaultValue="membros" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 gap-2 bg-transparent p-0">
            <TabsTrigger value="membros" className="data-[state=active]:bg-brand-purple data-[state=active]:text-white bg-card/70 text-brand-text-secondary hover:bg-brand-purple/20 transition-all py-2.5 text-sm sm:text-base">
                <Users className="mr-2 h-5 w-5" /> Membros
            </TabsTrigger>
            <TabsTrigger value="historico" className="data-[state=active]:bg-brand-purple data-[state=active]:text-white bg-card/70 text-brand-text-secondary hover:bg-brand-purple/20 transition-all py-2.5 text-sm sm:text-base">
                <History className="mr-2 h-5 w-5" /> Histórico
            </TabsTrigger>
            <TabsTrigger value="uniformes" className="data-[state=active]:bg-brand-purple data-[state=active]:text-white bg-card/70 text-brand-text-secondary hover:bg-brand-purple/20 transition-all py-2.5 text-sm sm:text-base">
                <Shirt className="mr-2 h-5 w-5" /> Uniformes
            </TabsTrigger>
          </TabsList>
          <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.3, delay: 0.1 }}
             className="mt-4"
           >
            <TabsContent value="membros" className="bg-card/70 backdrop-blur-sm p-6 rounded-lg shadow-md border-brand-border">
              <MembrosList patotaId={patotaId} userRole={userRole} />
            </TabsContent>
            <TabsContent value="historico" className="bg-card/70 backdrop-blur-sm p-6 rounded-lg shadow-md border-brand-border">
              <PartidasHistorico patotaId={patotaId} userRole={userRole} />
            </TabsContent>
            <TabsContent value="uniformes" className="bg-card/70 backdrop-blur-sm p-6 rounded-lg shadow-md border-brand-border">
              <UniformeChecklist patotaId={patotaId} userRole={userRole} />
            </TabsContent>
          </motion.div>
        </Tabs>
      </motion.div>
      <NovaPartidaModal patotaId={patotaId} isOpen={isNovaPartidaModalOpen} onClose={() => setIsNovaPartidaModalOpen(false)} />
    </div>
  );
}

export default PatotaPage;
  