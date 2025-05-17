
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-dark-bg via-purple-900 to-brand-dark-bg text-brand-text-primary p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
        className="text-center"
      >
        <AlertTriangle className="mx-auto h-24 w-24 text-brand-red mb-8 animate-pulse" />
        <h1 className="text-6xl font-bold text-brand-purple mb-4">404</h1>
        <p className="text-2xl text-brand-text-secondary mb-8">Oops! Página não encontrada.</p>
        <p className="text-lg text-brand-text-secondary mb-10">
          A página que você está procurando pode ter sido removida ou não existe.
        </p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button asChild size="lg" className="gradient-button text-lg px-8 py-4">
            <Link to="/dashboard">Voltar para o Início</Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default NotFoundPage;
