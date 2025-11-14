import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, TrendingUp, ArrowRight } from 'lucide-react';
import './styles/homepage.css';

const Homepage = () => {
  const portals = [
    {
      title: 'Client Portal',
      description: 'Access your portfolio, FAQs, training resources, and personalized insights.',
      icon: Users,
      path: '/client',
      gradient: 'from-brand via-brand-accent to-brand-soft',
      features: ['Dashboard', 'FAQ Support', 'Training Hub', 'Customer Care', 'Progress Tracking'],
    },
    {
      title: 'Advisor Portal',
      description: 'Professional tools and insights for financial advisors.',
      icon: TrendingUp,
      path: '/advisor',
      gradient: 'from-brand-deep via-brand to-brand-accent',
      features: ['Client Analytics', 'Market Insights', 'Portfolio Tools', 'Reporting', 'Compliance'],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const cardVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-hidden relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sky-200 rounded-full blur-3xl opacity-40" />
      </div>

      <motion.div
        className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo and Header */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-brand to-brand-accent shadow-soft mb-6"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-white font-bold text-3xl">C</span>
          </motion.div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-brand to-brand-accent bg-clip-text text-transparent">CFS Portal</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto">
            Choose your portal to access personalized financial services and insights
          </p>
        </motion.div>

        {/* Portal Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 w-full max-w-5xl"
          variants={containerVariants}
        >
          {portals.map((portal) => (
            <motion.div
              key={portal.path}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group"
            >
              <Link to={portal.path} className="block">
                <div className="relative h-full bg-white border border-gray-200 rounded-3xl p-8 cursor-pointer overflow-hidden shadow-soft hover:shadow-lg transition-all duration-300">
                  {/* Gradient background on hover */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${portal.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <motion.div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${portal.gradient} mb-6 shadow-lg`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <portal.icon className="w-8 h-8 text-white" />
                    </motion.div>

                    {/* Title */}
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 group-hover:text-brand transition-colors">
                      {portal.title}
                    </h2>

                    {/* Description */}
                    <p className="text-gray-700 mb-6 leading-relaxed text-base">
                      {portal.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {portal.features.map((feature, idx) => (
                        <motion.li
                          key={feature}
                          className="flex items-center text-sm text-gray-800 font-medium"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + idx * 0.1 }}
                        >
                          <div className="w-2 h-2 rounded-full bg-brand mr-3 flex-shrink-0" />
                          {feature}
                        </motion.li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <div className="flex items-center text-brand font-semibold group-hover:text-brand-accent transition-colors">
                      <span>Access Portal</span>
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </motion.div>
    </div>
  );
};

export default Homepage;
