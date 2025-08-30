import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Building2, 
  Heart, 
  Users, 
  ExternalLink,
  Clock,
  CheckCircle,
  Shield,
  Github
} from 'lucide-react';

const Footer = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  



  return (
    <footer className="hidden md:block bg-white border-t-2 border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        
          
      </div>
    </footer>
  );
};

export default Footer;
