import { motion } from 'framer-motion';
import { TrendingUp, Eye, ThumbsUp, MessageCircle, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

interface FAQAnalyticsProps {
  popularFAQs: any[];
  topRatedFAQs: any[];
  categoryStats: any[];
  onFAQClick: (faqId: string) => void;
}

const FAQAnalytics = ({ popularFAQs, topRatedFAQs, categoryStats, onFAQClick }: FAQAnalyticsProps) => {
  const totalViews = categoryStats.reduce((sum, cat) => sum + cat.views, 0);
  const totalFAQs = categoryStats.reduce((sum, cat) => sum + cat.count, 0);
  const avgHelpfulness = categoryStats.reduce((sum, cat) => sum + cat.avgHelpful, 0) / categoryStats.length;

  const stats = [
    {
      label: 'Total FAQs',
      value: totalFAQs,
      icon: MessageCircle,
      color: 'from-blue-500 to-cyan-500',
      change: '+2 this week'
    },
    {
      label: 'Total Views',
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: 'from-green-500 to-emerald-500',
      change: '+1.2k this week'
    },
    {
      label: 'Avg Helpfulness',
      value: `${avgHelpfulness.toFixed(0)}%`,
      icon: ThumbsUp,
      color: 'from-purple-500 to-pink-500',
      change: '+3% this month'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          FAQ Analytics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="solid" hover className="p-6 border-2 border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <Badge variant="success" size="sm">
                      {stat.change}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1 font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Popular FAQs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">🔥 Most Popular Questions</h3>
          <Badge variant="primary">Top 5</Badge>
        </div>
        <Card variant="gradient" className="p-6 border-2 border-gray-100">
          <div className="space-y-4">
            {popularFAQs.slice(0, 5).map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-start gap-4 p-4 bg-white rounded-xl hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onFAQClick(faq.id)}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold shadow-lg">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 mb-2 leading-tight">{faq.question}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {faq.views.toLocaleString()} views
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4 text-green-600" />
                      {Math.round((faq.helpful / (faq.helpful + faq.notHelpful)) * 100)}% helpful
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Rated FAQs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">⭐ Highest Rated Answers</h3>
          <Badge variant="success">96%+ Helpful</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topRatedFAQs.slice(0, 4).map((faq, index) => {
            const helpfulPercent = Math.round((faq.helpful / (faq.helpful + faq.notHelpful)) * 100);
            return (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card
                  variant="solid"
                  hover
                  className="p-5 border-2 border-gray-100 cursor-pointer"
                  onClick={() => onFAQClick(faq.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="success" size="sm" className="bg-green-600">
                      {helpfulPercent}% Helpful
                    </Badge>
                    <span className="text-xs text-gray-500">{faq.views.toLocaleString()} views</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2 leading-tight line-clamp-2">
                    {faq.question}
                  </h4>
                  <Button variant="ghost" size="sm" className="mt-2 w-full">
                    Read Answer
                  </Button>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Category Stats */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Questions by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryStats.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.05 }}
            >
              <Card variant="solid" hover className="p-5 border-2 border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${cat.gradient} shadow-md`}>
                    <cat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{cat.name}</h4>
                    <p className="text-sm text-gray-600">{cat.count} questions</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Views</span>
                    <span className="font-semibold text-gray-900">{cat.views.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Helpful</span>
                    <span className="font-semibold text-green-600">{cat.avgHelpful}%</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQAnalytics;
