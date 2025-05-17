
import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Menu, UserCircle, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-brand-dark-bg overflow-hidden">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>
      
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card p-4 shadow-md sticky top-0 z-30 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-brand-text-primary md:hidden">
            <Menu className="w-6 h-6" />
          </Button>
          <div className="md:hidden"></div> {/* Spacer for mobile to push dropdown to the right */}
          <div className="hidden md:flex md:flex-1"></div> {/* Spacer for desktop */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full text-brand-text-primary hover:bg-brand-purple/10">
                  <UserCircle className="h-7 w-7 text-brand-purple" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-card border-brand-border" align="end">
                <DropdownMenuLabel className="text-brand-text-primary">
                  {user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-brand-border" />
                {/* Add more items like "Profile", "Settings" here if needed */}
                {/* <DropdownMenuItem className="text-brand-text-secondary hover:!bg-brand-purple/20 hover:!text-brand-text-primary">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem> */}
                <DropdownMenuItem onClick={handleLogout} className="text-brand-red hover:!bg-brand-red/20 hover:!text-brand-red focus:bg-brand-red/20 focus:text-brand-red">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Deslogar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <Toaster />
    </div>
  );
}

export default Layout;
  