import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    products: [
      { name: 'Superannuation', path: '/products/super' },
      { name: 'Investments', path: '/products/investments' },
      { name: 'Insurance', path: '/products/insurance' },
      { name: 'Retirement', path: '/products/retirement' },
    ],
    support: [
      { name: 'FAQ', path: '/faq' },
      { name: 'Contact Us', path: '/contact' },
      { name: 'Personal Tutor', path: '/tutor' },
      { name: 'Resources', path: '/resources' },
    ],
    legal: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Accessibility', path: '/accessibility' },
      { name: 'Complaints', path: '/complaints' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: '#', color: 'hover:text-blue-600' },
    { name: 'Twitter', icon: Twitter, url: '#', color: 'hover:text-sky-500' },
    { name: 'LinkedIn', icon: Linkedin, url: '#', color: 'hover:text-blue-700' },
    { name: 'Instagram', icon: Instagram, url: '#', color: 'hover:text-pink-600' },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-white border-t border-gray-200 mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <h3 className="text-lg font-display font-bold gradient-text">
                Demo Portal
              </h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Interactive demo of a member portal with FAQ system and personal tutor features.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-primary" />
                <span className="italic">1800 XXX XXX (Demo)</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-primary" />
                <span className="italic">demo@example.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="italic">Location (Demo)</span>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Products</h4>
            <ul className="space-y-2">
              {footerLinks.products.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-600 hover:text-primary transition-colors duration-200 inline-block hover:translate-x-1 transform"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-600 hover:text-primary transition-colors duration-200 inline-block hover:translate-x-1 transform"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-600 hover:text-primary transition-colors duration-200 inline-block hover:translate-x-1 transform"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Media & Demo Notice */}
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Social Links */}
          <div className="flex items-center space-x-4">
            {socialLinks.map((social) => (
              <motion.a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-gray-600 ${social.color} transition-colors duration-200`}
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                aria-label={social.name}
              >
                <social.icon className="w-5 h-5" />
              </motion.a>
            ))}
          </div>

          {/* Demo Notice */}
          <div className="text-sm text-gray-600 text-center md:text-right">
            <p className="font-semibold text-gray-700">🎨 Demo Application • {currentYear}</p>
            <p className="text-xs mt-1 italic">
              For demonstration purposes only
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
