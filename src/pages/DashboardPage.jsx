
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Users, ArrowRight, Shield, UserCheck, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const PatotaCard = ({ id, name, role, onAccess }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    whileHover={{ scale: 1.03, boxShadow: "0px 10px 20px rgba(124, 58, 237, 0.3)" }}
  >
    <Card className="bg-card/80 backdrop-blur-sm hover:border-brand-purple transition-all duration-300">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl text-brand-purple">{name}</CardTitle>
          {role === 'Administrador' ? (
            <Shield className="w-6 h-6 text-brand-green" />
          ) : (
            <UserCheck className="w-6 h-6 text-brand-text-secondary" />
          )}
        </div>
        <CardDescription className="text-brand-text-secondary">{role}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-brand-text-secondary">Clique para gerenciar os detalhes da patota.</p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => onAccess(id)} className="w-full gradient-button">
          Acessar Patota <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  </motion.div>
);


function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patotas, setPatotas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPatotas = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        // Primeiro, obtemos os IDs das patotas das quais o usuário é membro e o seu papel.
        const { data: memberData, error: memberError } = await supabase
          .from('patota_members')
          .select('patota_id, role')
          .eq('user_id', user.id);

        if (memberError) throw memberError;

        if (!memberData || memberData.length === 0) {
          setPatotas([]);
          setIsLoading(false);
          return;
        }
        
        const patotaIds = memberData.map(m => m.patota_id);

        // Agora, buscamos os detalhes dessas patotas.
        const { data: patotasData, error: patotasError } = await supabase
          .from('patotas')
          .select('id, name, description')
          .in('id', patotaIds);

        if (patotasError) throw patotasError;

        const formattedPatotas = patotasData.map(p => {
          const memberInfo = memberData.find(m => m.patota_id === p.id);
          return {
            id: p.id,
            name: p.name,
            description: p.description,
            role: memberInfo ? memberInfo.role : 'Membro', // Fallback, though should always exist
          };
        });
        
        setPatotas(formattedPatotas);

      } catch (error) {
        console.error('Error fetching patotas:', error);
        toast({
          variant: "destructive",
          title: "Erro ao buscar patotas",
          description: error.message || "Não foi possível carregar suas patotas.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatotas();
  }, [user, toast]);

  const handleAccessPatota = (patotaId) => {
    navigate(`/patota/${patotaId}`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-brand-text-primary mb-2">
          Bem-vindo, <span className="text-brand-purple">{user?.user_metadata?.full_name || user?.email || 'Usuário'}</span>!
        </h1>
        <p className="text-lg text-brand-text-secondary">Gerencie suas patotas e partidas aqui.</p>
      </motion.div>

      <div className="mb-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button asChild className="gradient-button w-full sm:w-auto">
            <Link to="/patotas/create">
              <PlusCircle className="mr-2 h-5 w-5" /> Criar Nova Patota
            </Link>
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button asChild variant="outline" className="text-brand-purple border-brand-purple hover:bg-brand-purple/10 hover:text-brand-purple w-full sm:w-auto">
            <Link to="/patotas/join">
              <Users className="mr-2 h-5 w-5" /> Entrar em Patota Existente
            </Link>
          </Button>
        </motion.div>
      </div>
      
      <div>
        <h2 className="text-3xl font-semibold text-brand-text-primary mb-6">Suas Patotas</h2>
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-brand-purple" />
          </div>
        ) : patotas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patotas.map((patota, index) => (
               <motion.div
                key={patota.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <PatotaCard
                  id={patota.id}
                  name={patota.name}
                  role={patota.role}
                  onAccess={handleAccessPatota}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-10 bg-card/50 rounded-lg"
          >
            <Users className="mx-auto h-16 w-16 text-brand-text-secondary mb-4" />
            <p className="text-xl text-brand-text-secondary">Você ainda não participa de nenhuma patota.</p>
            <p className="text-brand-text-secondary">Crie uma nova ou entre em uma existente para começar!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
