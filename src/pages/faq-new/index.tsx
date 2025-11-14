import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ChevronDown, 
  ThumbsUp, 
  ThumbsDown, 
  Filter,
  PiggyBank,
  TrendingUp,
  Shield,
  Home,
  User,
  X
} from 'lucide-react';
import faqData from './data/faqData.json';
import Card from './components/ui/Card';
import Button from './components/ui/Button';
import Badge from './components/ui/Badge';
import Input from './components/ui/Input';
import { useToast } from '../../common/context/ToastContext';
import './styles/faq-new.css';

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [votedFAQs, setVotedFAQs] = useState<{ [key: string]: 'helpful' | 'notHelpful' }>({});
  const { showToast } = useToast();

  // Category icons
  const categoryIcons: { [key: string]: any } = {
    PiggyBank,
    TrendingUp,
    Shield,
    Home,
    User
  };

  // Category colors
  const categoryColors: { [key: string]: string } = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-pink-500',
    orange: 'from-orange-500 to-red-500',
    red: 'from-red-500 to-rose-500'
  };

  // Filter FAQs
  const filteredFAQs = useMemo(() => {
    let results = faqData.faqs;

    // Filter by category
    if (selectedCategory) {
      results = results.filter(faq => faq.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(faq => 
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return results;
  }, [searchQuery, selectedCategory]);

  const handleVote = (faqId: string, vote: 'helpful' | 'notHelpful') => {
    setVotedFAQs(prev => ({ ...prev, [faqId]: vote }));
    showToast(vote === 'helpful' ? 'Thanks for your feedback!' : 'We\'ll work on improving this answer', 'success');
  };

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Hero Section */}
        <motion.section
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl mb-6">
            <Search className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about your super, investments, and insurance
          </p>
        </motion.section>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="solid" className="p-6 border-2 border-gray-100">
            <Input
              type="text"
              placeholder="Search for answers... (e.g., 'contribution limits', 'retirement age')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-5 h-5" />}
              className="text-lg"
            />
          </Card>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filter by Category</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={selectedCategory === null ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              icon={selectedCategory === null ? undefined : <X className="w-4 h-4" />}
            >
              All Categories ({faqData.faqs.length})
            </Button>
            {faqData.categories.map((category) => {
              const Icon = categoryIcons[category.icon];
              const count = faqData.faqs.filter(faq => faq.category === category.id).length;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  icon={<Icon className="w-4 h-4" />}
                >
                  {category.name} ({count})
                </Button>
              );
            })}
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-sm text-gray-600">
            Showing <span className="font-bold text-gray-900">{filteredFAQs.length}</span> {filteredFAQs.length === 1 ? 'result' : 'results'}
            {searchQuery && ` for "${searchQuery}"`}
            {selectedCategory && ` in ${faqData.categories.find(c => c.id === selectedCategory)?.name}`}
          </p>
        </motion.div>

        {/* FAQ List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredFAQs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card variant="solid" className="p-12 text-center border-2 border-gray-100">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory(null);
                    }}
                  >
                    Clear all filters
                  </Button>
                </Card>
              </motion.div>
            ) : (
              filteredFAQs.map((faq, index) => {
                const category = faqData.categories.find(c => c.id === faq.category);
                const Icon = category ? categoryIcons[category.icon] : User;
                const isExpanded = expandedFAQ === faq.id;
                const userVote = votedFAQs[faq.id];

                return (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <Card variant="solid" hover className="border-2 border-gray-100 overflow-hidden">
                      {/* Question Header */}
                      <button
                        className="w-full p-6 text-left flex items-start gap-4 hover:bg-gray-50 transition-colors"
                        onClick={() => toggleFAQ(faq.id)}
                      >
                        {/* Category Icon */}
                        <div className={`flex-shrink-0 p-3 rounded-xl bg-gradient-to-br ${category ? categoryColors[category.color] : categoryColors.blue} shadow-md`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>

                        {/* Question Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                              {faq.question}
                            </h3>
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />
                            </motion.div>
                          </div>

                          {/* Metadata */}
                          <div className="flex flex-wrap items-center gap-2">
                            {category && (
                              <Badge variant="primary" size="sm">
                                {category.name}
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {faq.views.toLocaleString()} views
                            </span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-green-600 font-medium">
                              {Math.round((faq.helpful / (faq.helpful + faq.notHelpful)) * 100)}% found helpful
                            </span>
                          </div>
                        </div>
                      </button>

                      {/* Answer (Expanded) */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="px-6 pb-6 border-t border-gray-100">
                              {/* Answer Text */}
                              <div className="pt-6 pb-6">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                  {faq.answer}
                                </p>
                              </div>

                              {/* Tags */}
                              {faq.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                  {faq.tags.map(tag => (
                                    <Badge key={tag} variant="default" size="sm" className="bg-gray-100 text-gray-700">
                                      #{tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Helpful Rating */}
                              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                                <span className="text-sm text-gray-600 font-medium">Was this helpful?</span>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant={userVote === 'helpful' ? 'success' : 'ghost'}
                                    size="sm"
                                    icon={<ThumbsUp className="w-4 h-4" />}
                                    onClick={() => handleVote(faq.id, 'helpful')}
                                    disabled={!!userVote}
                                  >
                                    Yes ({faq.helpful})
                                  </Button>
                                  <Button
                                    variant={userVote === 'notHelpful' ? 'danger' : 'ghost'}
                                    size="sm"
                                    icon={<ThumbsDown className="w-4 h-4" />}
                                    onClick={() => handleVote(faq.id, 'notHelpful')}
                                    disabled={!!userVote}
                                  >
                                    No ({faq.notHelpful})
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
