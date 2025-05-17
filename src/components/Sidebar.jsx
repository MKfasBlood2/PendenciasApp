
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Home, ShieldPlus, LogIn, LogOut, Menu, X, Users, History, PlusCircle, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const NavItem = ({ to, icon, children, onClick }) => (
  <motion.li
    whileHover={{ x: 5, backgroundColor: 'rgba(124, 58, 237, 0.2)' }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center p-3 my-1 rounded-lg text-brand-text-secondary hover:text-brand-text-primary transition-colors"
    >
      {icon && React.cloneElement(icon, { className: "w-6 h-6 mr-3 text-brand-purple" })}
      {children}
    </Link>
  </motion.li>
);

function Sidebar({ isOpen, toggleSidebar }) {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    if (toggleSidebar) toggleSidebar(); // Close sidebar on mobile after logout
  };

  return (
    <motion.aside
      initial={false}
      animate={isOpen ? "open" : "closed"}
      variants={{
        open: { x: 0, width: '280px' },
        closed: { x: '-100%', width: '280px' }
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`fixed inset-y-0 left-0 z-50 bg-card text-brand-text-primary p-6 flex flex-col shadow-2xl md:relative md:translate-x-0 md:w-72 transform transition-transform duration-300 ease-in-out`}
    >
      <div className="flex items-center justify-between mb-10">
        <Link to="/" className="text-3xl font-bold text-brand-purple flex items-center">
          <Trophy className="w-8 h-8 mr-2"/> Patotas<span className="text-brand-green">.</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden text-brand-text-primary">
          <X className="w-6 h-6" />
        </Button>
      </div>

      <nav className="flex-grow">
        <ul className="space-y-2">
          {isAuthenticated ? (
            <>
              <NavItem to="/dashboard" icon={<Home />}>Minhas Patotas</NavItem>
              <NavItem to="/patotas/create" icon={<ShieldPlus />}>Criar Patota</NavItem>
              <NavItem to="/patotas/join" icon={<LogIn />}>Entrar em Patota</NavItem>
            </>
          ) : (
            <NavItem to="/login" icon={<LogIn />}>Login</NavItem>
          )}
        </ul>
      </nav>

      {isAuthenticated && (
        <div className="mt-auto">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-brand-text-secondary hover:text-brand-red hover:bg-brand-red/10"
          >
            <LogOut className="w-6 h-6 mr-3 text-brand-red" />
            Sair
          </Button>
        </div>
      )}
    </motion.aside>
  );
}

export default Sidebar;
