import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft, HelpCircle, GraduationCap, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './components/ui/Button';
import Input from './components/ui/Input';
import { useState } from 'react';
import './styles/not-found.css';

const NotFound = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const quickLinks = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'FAQ', path: '/faq', icon: HelpCircle },
    { name: 'Personal Tutor', path: '/tutor', icon: GraduationCap },
    { name: 'Progress', path: '/progress', icon: Trophy }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/faq?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Large 404 */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-9xl md:text-[200px] font-bold bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent leading-none">
              404
            </h1>
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-3xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            This page took a vacation
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
          >
            We couldn't find the page you're looking for. 
            It might have been moved, deleted, or never existed in the first place.
          </motion.p>

          {/* Animated Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-12 flex justify-center"
          >
            <div className="relative">
              {/* Lost person with map illustration using emojis */}
              <div className="text-8xl animate-bounce">
                🗺️
              </div>
              <div className="text-6xl absolute -right-8 -bottom-4">
                🧭
              </div>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search for what you're looking for..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search className="w-5 h-5" />}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={<Search className="w-5 h-5" />}
              >
                Search
              </Button>
            </div>
          </motion.form>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mb-8"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Quick Links
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {quickLinks.map((link, index) => (
                <motion.button
                  key={link.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
                  onClick={() => navigate(link.path)}
                  className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <link.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-medium text-gray-900">{link.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <Button
              variant="ghost"
              size="lg"
              icon={<ArrowLeft className="w-5 h-5" />}
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
