import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Award, 
  Calendar, 
  Briefcase, 
  ArrowRight,
  Shield,
  ArrowUpRight,
  ArrowDownCircle,
  PlusCircle,
  RefreshCw,
  Gift,
  Clock
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import { useToast } from '../context/ToastContext';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const { user, transactions } = useUser();
  const { showToast } = useToast();

  // Portfolio growth data (mock)
  const portfolioData = [
    { month: 'Jan', value: 118000 },
    { month: 'Feb', value: 122000 },
    { month: 'Mar', value: 125000 },
    { month: 'Apr', value: 128000 },
    { month: 'May', value: 132000 },
    { month: 'Jun', value: 135000 },
    { month: 'Jul', value: 138000 },
    { month: 'Aug', value: 140000 },
    { month: 'Sep', value: 142750 },
  ];

  // Asset allocation data
  const assetData = [
    { name: 'Superannuation', value: user.products[0].balance, color: '#D81421' },
    { name: 'Growth Fund', value: user.products[1].balance, color: '#005847' },
    { name: 'Conservative Fund', value: user.products[2].balance, color: '#3b82f6' },
  ];

  // Quick stats
  const stats = [
    {
      label: 'Total Contributions',
      value: '$12,600',
      change: '+8.2%',
      trend: 'up',
      icon: ArrowDownCircle,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      label: 'Investment Returns',
      value: '$15,875',
      change: '+12.5%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      label: 'Monthly Growth',
      value: '$2,750',
      change: '+3.1%',
      trend: 'up',
      icon: ArrowUpRight,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
  ];

  const getTransactionIcon = (type: string) => {
    switch(type) {
      case 'Employer Contribution':
      case 'Personal Contribution':
        return ArrowDownCircle;
      case 'Investment':
        return PlusCircle;
      case 'Rebalance':
        return RefreshCw;
      case 'Distribution':
        return Gift;
      default:
        return DollarSign;
    }
  };

  const getTransactionColor = (category: string) => {
    switch(category) {
      case 'Contribution':
        return 'success';
      case 'Investment':
        return 'primary';
      case 'Income':
        return 'info';
      case 'Fee':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Hero Section - Colorful Gradient */}
        <motion.section
          className="relative overflow-hidden rounded-3xl p-8 md:p-12 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 text-white shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated Gradient Orbs */}
          <motion.div
            className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-400/30 to-orange-500/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-400/30 to-cyan-500/30 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  <Award className="w-4 h-4 mr-1" />
                  {user.investmentLevel} Investor
                </Badge>
                <Badge variant="success" className="bg-emerald-800 text-white border-emerald-600 backdrop-blur-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Portfolio Growing
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-display font-bold mb-3 bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">
                Welcome back, {user.firstName}! 👋
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 font-medium">
                Your wealth is growing beautifully
              </p>
            </motion.div>
            
            {/* Portfolio Value - Extra Colorful */}
            <motion.div
              className="inline-block bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-xl rounded-3xl px-8 py-6 border-2 border-white/30 shadow-2xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-sm text-white/80 mb-2 font-semibold uppercase tracking-wide">Total Portfolio Value</p>
              <p className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">
                ${user.portfolio.totalValue.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="success" className="bg-emerald-800 text-white border-emerald-600 text-lg px-4 py-2">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  +{user.portfolio.growthThisYear}% this year
                </Badge>
                <Badge variant="info" className="bg-blue-400/30 text-white border-blue-200/30 text-lg px-4 py-2">
                  +${user.portfolio.growthAmount.toLocaleString()}
                </Badge>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Quick Stats Row - Colorful Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
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

        {/* Bento Box Layout - Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Portfolio Growth Chart - Takes 2 columns */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card variant="gradient" className="p-6 h-full border-2 border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                Portfolio Growth (2024)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={portfolioData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D81421" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#D81421" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" tickFormatter={(value) => `$${(value / 1000)}k`} />
                  <Tooltip 
                    formatter={(value: any) => [`$${value.toLocaleString()}`, 'Value']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '2px solid #e5e7eb', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#D81421" 
                    strokeWidth={3}
                    fill="url(#colorValue)"
                    dot={{ fill: '#D81421', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Asset Allocation Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card variant="solid" className="p-6 h-full border-2 border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                Asset Mix
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={assetData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {assetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => `$${value.toLocaleString()}`}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '2px solid #e5e7eb', 
                      borderRadius: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {assetData.map((asset) => (
                  <div key={asset.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.color }} />
                      <span className="text-sm text-gray-600">{asset.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      ${(asset.value / 1000).toFixed(0)}k
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Products & Activity Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Your Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card variant="glass" className="p-6 border-2 border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                Your Products
              </h3>
              <div className="space-y-4">
                {user.products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <Badge variant="primary" size="sm" className="mb-2">
                        {product.type}
                      </Badge>
                      <p className="font-semibold text-gray-900">{product.name}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        ${product.balance.toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="success">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +{product.growth}%
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <Card variant="solid" className="p-6 border-2 border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                Recent Activity
              </h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {transactions.slice(0, 5).map((txn: any) => {
                  const Icon = getTransactionIcon(txn.type);
                  const variant = getTransactionColor(txn.category) as any;
                  return (
                    <div key={txn.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className={`p-2 rounded-lg ${
                        variant === 'success' ? 'bg-green-100' :
                        variant === 'primary' ? 'bg-red-100' :
                        variant === 'info' ? 'bg-blue-100' :
                        variant === 'danger' ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          variant === 'success' ? 'text-green-600' :
                          variant === 'primary' ? 'text-red-600' :
                          variant === 'info' ? 'text-blue-600' :
                          variant === 'danger' ? 'text-red-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{txn.type}</p>
                        <p className="text-xs text-gray-600">{txn.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{txn.date}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${txn.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {txn.amount >= 0 ? '+' : ''}${Math.abs(txn.amount).toLocaleString()}
                        </p>
                        <Badge variant={variant} size="sm" className="mt-1">
                          {txn.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Goals Section - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Card variant="gradient" className="p-8 border-2 border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl shadow-lg">
                  <Target className="w-7 h-7 text-white" />
                </div>
                Your Financial Goals
              </h2>
              <Button 
                variant="primary"
                size="sm"
                onClick={() => showToast('Goal management coming soon!', 'info')}
              >
                Manage Goals
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user.goals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  className="p-6 bg-white rounded-2xl shadow-md border-2 border-gray-100"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-xl mb-1">{goal.name}</h3>
                      <p className="text-sm text-gray-600">
                        Target by {new Date(goal.targetDate).getFullYear()}
                      </p>
                    </div>
                    <Badge variant={goal.progress > 50 ? 'success' : 'warning'} size="lg" className="text-lg px-4 py-2">
                      {goal.progress.toFixed(0)}%
                    </Badge>
                  </div>
                  
                  <ProgressBar 
                    value={goal.progress} 
                    color={goal.progress > 50 ? 'success' : 'warning'}
                    size="lg"
                    animated
                    striped
                  />
                  
                  <div className="flex items-center justify-between mt-4 text-sm">
                    <span className="font-semibold text-gray-700">
                      ${goal.currentAmount.toLocaleString()} saved
                    </span>
                    <span className="text-gray-600">
                      ${goal.targetAmount.toLocaleString()} goal
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
