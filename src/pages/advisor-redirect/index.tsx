import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, TrendingUp } from 'lucide-react';
import './styles/advisor-redirect.css';

const AdvisorRedirect = () => {
  const ADVISOR_PORTAL_URL = 'https://advisor-insight-studio.vercel.app/';

  useEffect(() => {
    // Redirect after 2 seconds
    const timer = setTimeout(() => {
      window.location.href = ADVISOR_PORTAL_URL;
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-deep via-brand to-brand-accent flex items-center justify-center px-4">
      <motion.div
        className="max-w-md w-full text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Icon */}
        <motion.div
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-lg mb-8"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <TrendingUp className="w-10 h-10 text-white" />
        </motion.div>

        {/* Content */}
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Redirecting to Advisor Portal
        </h1>
        
        <p className="text-white/80 text-lg mb-8">
          Please wait while we take you to the professional advisor platform...
        </p>

        {/* Loading animation */}
        <motion.div className="flex justify-center items-center space-x-2 mb-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-white rounded-full"
              animate={{
                y: [-10, 0, -10],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>

        {/* Manual link fallback */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-white/60 text-sm mb-4">
            Not redirecting automatically?
          </p>
          <a
            href={ADVISOR_PORTAL_URL}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl text-white font-semibold transition-all duration-200 border border-white/20"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Click here to continue</span>
            <ExternalLink className="w-5 h-5" />
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdvisorRedirect;
