import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, HelpCircle, GraduationCap, User, Trophy, LogOut, PhoneCall, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { getCurrentUser, logout } from '../../services/authService';
import { useCallNotifications } from '../../context/CallNotificationContext';
import { useTwoFANotifications } from '../../context/TwoFANotificationContext';
import { CallNotificationDropdown } from '../notifications/CallNotificationDropdown';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCallDropdownOpen, setIsCallDropdownOpen] = useState(false);
  const { user, dbUser } = useUser();
  const location = useLocation();
  const { incomingCalls } = useCallNotifications();
  const { pendingTwoFARequests } = useTwoFANotifications();
  
  // Get session user if logged in
  const sessionUser = getCurrentUser();
  
  // Display name - prioritize dbUser (real data) over mock data
  const displayName = dbUser?.full_name || (user as any).full_name || `${(user as any).firstName} ${(user as any).lastName}`;
  
  // Check if we're in the client portal
  const isClientPortal = location.pathname.startsWith('/client');
  
  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/client/dashboard', icon: Home },
    { name: 'FAQ', path: '/client/faq', icon: HelpCircle },
    { name: 'Learning', path: '/client/learning', icon: GraduationCap },
    { name: 'Progress', path: '/client/progress', icon: Trophy },
  ];

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/70 backdrop-blur-lg shadow-md'
          : 'bg-white/50 backdrop-blur-sm'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo - Centered */}
          <Link to={isClientPortal ? "/client/dashboard" : "/"} className="flex items-center space-x-3 group">
            <motion.div
              className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-white font-bold text-lg md:text-xl">C</span>
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-display font-bold gradient-text leading-none">
                Colonial First State
              </h1>
              <p className="text-xs text-gray-600 leading-none mt-0.5">Member Portal</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:text-primary hover:bg-primary/5 transition-all duration-200 font-medium group"
              >
                <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Call & Notification Buttons (Client Only) */}
          {sessionUser && sessionUser.role === 'client' && (
            <div className="hidden md:flex items-center gap-2 mr-2">
              {/* Call Notification Button */}
              <div className="relative">
                <motion.button
                  className={`call-notification-button relative w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    incomingCalls.length > 0
                      ? 'bg-green-500 hover:bg-green-600 animate-pulse'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCallDropdownOpen(!isCallDropdownOpen)}
                >
                  <PhoneCall
                    className={`w-5 h-5 ${
                      incomingCalls.length > 0 ? 'text-white' : 'text-gray-600'
                    }`}
                  />
                  {incomingCalls.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {incomingCalls.length}
                    </span>
                  )}
                </motion.button>

                {/* Call Notification Dropdown */}
                <CallNotificationDropdown
                  isOpen={isCallDropdownOpen}
                  onClose={() => setIsCallDropdownOpen(false)}
                />
              </div>

              {/* 2FA Notification Button */}
              <motion.button
                className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  pendingTwoFARequests.length > 0
                    ? 'bg-orange-500 hover:bg-orange-600 animate-pulse'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell
                  className={`w-5 h-5 ${
                    pendingTwoFARequests.length > 0 ? 'text-white' : 'text-gray-600'
                  }`}
                />
                {pendingTwoFARequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {pendingTwoFARequests.length}
                  </span>
                )}
              </motion.button>
            </div>
          )}

          {/* User Profile */}
          <div className="hidden md:flex items-center relative">
            <motion.div
              className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold shadow-lg cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <User className="w-5 h-5" />
            </motion.div>
            
            {/* User Dropdown */}
            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-3 px-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                      {displayName.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {displayName}
                      </p>
                      <p className="text-xs text-gray-600">{dbUser?.email || user.email}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 py-2 space-y-1">
                    <Link
                      to="/client/profile"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </motion.button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {/* Navigation Items */}
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:text-primary hover:bg-primary/5 transition-all duration-200 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                </motion.div>
              ))}
              
              {/* Mobile User Info */}
              <motion.div
                className="mt-4 pt-4 border-t border-gray-200 px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold shadow-lg">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-600">{dbUser?.email || sessionUser?.email || user.email}</p>
                  </div>
                </div>
                
                {/* Logout Button */}
                {sessionUser && (
                  <button
                    onClick={handleLogout}
                    className="mt-3 w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
