import { motion } from 'framer-motion';
import { BookOpen, Headphones, ExternalLink, Users, FileText, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import { useContentData } from '../hooks/useContentData';

const AdvisorDashboard = () => {
  const { data } = useContentData();

  const quickLinks = [
    {
      title: 'Training Hub',
      description: 'Access training modules, quizzes, and learning materials',
      icon: BookOpen,
      path: '/advisor/training-hub',
      color: 'from-blue-500 to-blue-600',
      stats: `${data?.modules?.length || 16} Modules`
    },
    {
      title: 'Customer Care',
      description: 'Guided workflows and procedures for customer service',
      icon: Headphones,
      path: '/advisor/customer-care',
      color: 'from-purple-500 to-purple-600',
      stats: `${data?.procedures?.length || 50}+ Procedures`
    },
    {
      title: 'External Portal',
      description: 'Access the main CFS Advisor Portal',
      icon: ExternalLink,
      path: 'https://www.colonialfirststate.com.au/advisers',
      color: 'from-green-500 to-green-600',
      stats: 'Open Portal',
      external: true
    }
  ];

  const stats = [
    {
      label: 'Training Modules',
      value: data?.modules?.length || 16,
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      label: 'Quizzes Available',
      value: data?.quizzes?.length || 16,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      label: 'Care Procedures',
      value: data?.procedures?.length || 50,
      icon: Headphones,
      color: 'text-purple-600'
    },
    {
      label: 'Active Advisors',
      value: '248',
      icon: Users,
      color: 'text-orange-600'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Welcome Header */}
          <motion.div variants={itemVariants}>
            <Card className="p-8 bg-gradient-to-br from-brand via-brand-accent to-brand-deep text-white relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10">
                <h1 className="text-4xl font-bold mb-2">Welcome to the Advisor Portal</h1>
                <p className="text-lg text-white/90 max-w-3xl">
                  Access comprehensive training materials, customer care procedures, and advisor resources all in one place.
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Quick Access Cards */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickLinks.map((link) => {
                const Icon = link.icon;

                const cardContent = (
                  <Card className="p-6 h-full hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${link.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-brand transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {link.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        {link.stats}
                      </span>
                      <span className="text-brand group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </div>
                  </Card>
                );

                return link.external ? (
                  <a
                    key={link.title}
                    href={link.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    {cardContent}
                  </a>
                ) : (
                  <Link
                    key={link.title}
                    to={link.path}
                    className="group"
                  >
                    {cardContent}
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* Statistics */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Portal Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className="p-6 text-center">
                    <Icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">
                      {stat.label}
                    </div>
                  </Card>
                );
              })}
            </div>
          </motion.div>

          {/* Recent Updates (Optional) */}
          <motion.div variants={itemVariants}>
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Getting Started</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-brand/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-brand">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Explore Training Hub</h3>
                    <p className="text-sm text-gray-600">Complete training modules to enhance your product knowledge</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-brand/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-brand">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Review Customer Care Procedures</h3>
                    <p className="text-sm text-gray-600">Access step-by-step guides for common customer scenarios</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-brand/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-brand">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Access External Resources</h3>
                    <p className="text-sm text-gray-600">Visit the external portal for additional advisor tools</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdvisorDashboard;
