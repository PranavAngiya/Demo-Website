import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../../common/context/UserContext';
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Award, 
  Briefcase, 
  ArrowUpRight,
  ArrowDownCircle,
  PlusCircle,
  RefreshCw,
  Gift,
  Clock
} from 'lucide-react';
import Card from './components/ui/Card';
import Button from './components/ui/Button';
import Badge from './components/ui/Badge';
import ProgressBar from './components/ui/ProgressBar';
import Spinner from './components/ui/Spinner';
import { useToast } from '../../common/context/ToastContext';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import './styles/dashboard.css';
import { getCurrentUser } from '../../common/services/authService';
import { getUserById, type User as DBUser } from '../../common/services/userService';
import { getSuperAccountsByUser, getRecentTransactions, type SuperannuationAccount, type SuperTransaction } from '../../common/services/superService';
import { getProductsByUser, getTotalPortfolioValue, type FinancialProduct } from '../../common/services/productService';

const Dashboard = () => {
  const { user: mockUser } = useUser();
  const { showToast } = useToast();
  
  // State for real data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [superAccounts, setSuperAccounts] = useState<SuperannuationAccount[]>([]);
  const [products, setProducts] = useState<FinancialProduct[]>([]);
  const [transactions, setTransactions] = useState<SuperTransaction[]>([]);
  const [portfolioValue, setPortfolioValue] = useState({ superTotal: 0, productsTotal: 0, grandTotal: 0 });
  
  // Goals management state
  const [goals, setGoals] = useState<any[]>([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [goalForm, setGoalForm] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: ''
  });

  // Fetch real data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get session user
        const sessionUser = getCurrentUser();
        if (!sessionUser) {
          setError('Not authenticated');
          setIsLoading(false);
          return;
        }

        // Fetch user data
        const userData = await getUserById(sessionUser.id);
        if (userData) {
          setDbUser(userData);
        }

        // Fetch super accounts
        const superData = await getSuperAccountsByUser(sessionUser.id);
        setSuperAccounts(superData);

        // Fetch products
        const productsData = await getProductsByUser(sessionUser.id);
        setProducts(productsData);

        // Fetch recent transactions
        const transactionsData = await getRecentTransactions(sessionUser.id, 10);
        setTransactions(transactionsData);

        // Fetch portfolio value
        const portfolioData = await getTotalPortfolioValue(sessionUser.id);
        setPortfolioValue(portfolioData);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Load goals from localStorage on mount
  useEffect(() => {
    const savedGoals = localStorage.getItem('userGoals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    } else if ((mockUser as any).goals) {
      // Use mock goals if no saved goals
      setGoals((mockUser as any).goals);
    }
  }, [mockUser]);
  
  // Save goals to localStorage whenever they change
  useEffect(() => {
    if (goals.length > 0) {
      localStorage.setItem('userGoals', JSON.stringify(goals));
    }
  }, [goals]);
  
  const openGoalModal = (goal?: any) => {
    if (goal) {
      setEditingGoal(goal);
      setGoalForm({
        name: goal.name,
        targetAmount: goal.targetAmount.toString(),
        currentAmount: goal.currentAmount.toString(),
        targetDate: goal.targetDate.split('T')[0]
      });
    } else {
      setEditingGoal(null);
      setGoalForm({ name: '', targetAmount: '', currentAmount: '', targetDate: '' });
    }
    setShowGoalModal(true);
  };
  
  const closeGoalModal = () => {
    setShowGoalModal(false);
    setEditingGoal(null);
    setGoalForm({ name: '', targetAmount: '', currentAmount: '', targetDate: '' });
  };
  
  const handleSaveGoal = () => {
    if (!goalForm.name || !goalForm.targetAmount || !goalForm.currentAmount || !goalForm.targetDate) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    
    const targetAmount = parseFloat(goalForm.targetAmount);
    const currentAmount = parseFloat(goalForm.currentAmount);
    
    if (isNaN(targetAmount) || isNaN(currentAmount)) {
      showToast('Please enter valid amounts', 'error');
      return;
    }
    
    const progress = (currentAmount / targetAmount) * 100;
    
    if (editingGoal) {
      // Update existing goal
      setGoals(goals.map(g => 
        g.id === editingGoal.id 
          ? { ...g, ...goalForm, targetAmount, currentAmount, progress }
          : g
      ));
      showToast('Goal updated successfully!', 'success');
    } else {
      // Add new goal
      const newGoal = {
        id: Date.now().toString(),
        ...goalForm,
        targetAmount,
        currentAmount,
        progress
      };
      setGoals([...goals, newGoal]);
      showToast('Goal added successfully!', 'success');
    }
    
    closeGoalModal();
  };
  
  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter(g => g.id !== goalId));
    showToast('Goal deleted', 'success');
  };

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

  // Asset allocation data - use real data if available
  const assetData = [
    { name: 'Superannuation', value: portfolioValue.superTotal, color: '#3B82F6', percentage: (portfolioValue.superTotal / portfolioValue.grandTotal * 100).toFixed(1) },
    { name: 'Financial Products', value: portfolioValue.productsTotal, color: '#10B981', percentage: (portfolioValue.productsTotal / portfolioValue.grandTotal * 100).toFixed(1) },
  ];

  // Quick stats
  const stats = [
    {
      label: 'Total Contributions',
      value: '$12,600',
      change: '+8.2%',
      trend: 'up',
      icon: ArrowDownCircle,
      color: 'from-brand to-brand-accent',
      bgColor: 'bg-brand-soft/30',
      textColor: 'text-brand'
    },
    {
      label: 'Investment Returns',
      value: '$15,875',
      change: '+12.5%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-brand-accent to-brand-deep',
      bgColor: 'bg-brand-soft/50',
      textColor: 'text-brand'
    },
    {
      label: 'Monthly Growth',
      value: '$2,750',
      change: '+3.1%',
      trend: 'up',
      icon: ArrowUpRight,
      color: 'from-brand-deep to-brand',
      bgColor: 'bg-brand-soft/40',
      textColor: 'text-brand-accent'
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state (with fallback to mock data)
  if (error && !dbUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <div className="text-red-600 mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Data</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Hero Section - CFS_Demo Gradient */}
        <motion.section
          className="relative overflow-hidden rounded-3xl p-8 md:p-12 bg-gradient-to-br from-brand via-brand-accent to-brand-deep text-white shadow-soft"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated Gradient Orbs */}
          <motion.div
            className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-brand-soft/40 to-brand-accent/30 rounded-full blur-3xl"
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
            className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-br from-brand-accent/30 to-brand-deep/40 rounded-full blur-3xl"
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
                  {dbUser?.risk_profile || (mockUser as any).investmentLevel} Investor
                </Badge>
                <Badge variant="success" className="bg-emerald-900 text-white border-emerald-600 backdrop-blur-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Portfolio Growing
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-display font-bold mb-3 bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">
                Welcome back, {dbUser?.full_name?.split(' ')[0] || (mockUser as any).firstName}! 👋
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
                ${(portfolioValue.grandTotal || (mockUser as any).portfolio?.totalValue || 0).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="success" className="bg-emerald-900 text-white border-emerald-600 text-lg px-4 py-2">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  +{(mockUser as any).portfolio?.growthThisYear || 0}% this year
                </Badge>
                <Badge variant="info" className="bg-blue-400/30 text-white border-blue-200/30 text-lg px-4 py-2">
                  +${((mockUser as any).portfolio?.growthAmount || 0).toLocaleString()}
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
                <div className="p-2 bg-gradient-to-br from-brand to-brand-accent rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                Portfolio Growth (2024)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={portfolioData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0c4a6e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0c4a6e" stopOpacity={0.1}/>
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
                    stroke="#0c4a6e" 
                    strokeWidth={3}
                    fill="url(#colorValue)"
                    dot={{ fill: '#0c4a6e', r: 5 }}
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
                <div className="p-2 bg-gradient-to-br from-brand-accent to-brand-deep rounded-lg">
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
                {assetData.map((asset: any) => (
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
                <div className="p-2 bg-gradient-to-br from-brand to-brand-deep rounded-lg">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                Your Products
              </h3>
              <div className="space-y-4">
                {/* Super Accounts */}
                {superAccounts.map((account) => (
                  <Link
                    key={account.id}
                    to={`/client/products/${account.id}`}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all hover:border-brand cursor-pointer"
                  >
                    <div className="flex-1">
                      <Badge variant="primary" size="sm" className="mb-2">
                        Superannuation
                      </Badge>
                      <p className="font-semibold text-gray-900">{account.fund_name}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        ${account.current_balance.toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={account.status === 'active' ? 'success' : 'secondary'}>
                      {account.status}
                    </Badge>
                  </Link>
                ))}
                
                {/* Financial Products */}
                {products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/client/products/${product.id}`}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all hover:border-brand cursor-pointer"
                  >
                    <div className="flex-1">
                      <Badge variant="info" size="sm" className="mb-2">
                        {product.product_type}
                      </Badge>
                      <p className="font-semibold text-gray-900">{product.product_name}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        ${product.current_value.toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={(product.status === 'active') ? 'success' : 'secondary'}>
                      {product.status}
                    </Badge>
                  </Link>
                ))}
                
                {superAccounts.length === 0 && products.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No products found</p>
                )}
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
                <div className="p-2 bg-gradient-to-br from-brand-accent to-brand rounded-lg">
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
                onClick={() => openGoalModal()}
              >
                + Add Goal
              </Button>
            </div>
            
            {goals.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Financial Goals Yet</h3>
                <p className="text-gray-600 mb-6">Start planning your financial future by setting your first goal</p>
                <Button variant="primary" onClick={() => openGoalModal()}>
                  + Add Your First Goal
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goals.map((goal: any, index: number) => (
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
                  
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => openGoalModal(goal)}
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </motion.div>
              ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
      
      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {editingGoal ? 'Edit Goal' : 'Add New Goal'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Name
                </label>
                <input
                  type="text"
                  value={goalForm.name}
                  onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                  placeholder="e.g., House Deposit, Vacation"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Amount ($)
                </label>
                <input
                  type="number"
                  value={goalForm.targetAmount}
                  onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
                  placeholder="50000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Amount ($)
                </label>
                <input
                  type="number"
                  value={goalForm.currentAmount}
                  onChange={(e) => setGoalForm({ ...goalForm, currentAmount: e.target.value })}
                  placeholder="10000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Date
                </label>
                <input
                  type="date"
                  value={goalForm.targetDate}
                  onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={closeGoalModal}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveGoal}
                className="flex-1"
              >
                {editingGoal ? 'Update Goal' : 'Add Goal'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
