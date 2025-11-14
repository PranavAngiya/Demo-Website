import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, User, DollarSign, 
  TrendingUp, Shield, Users,
  PieChart, PhoneCall,
  Mail, Phone, MapPin, Calendar,
  FileText, Edit, ChevronDown, ChevronUp
} from 'lucide-react';
import Card from '../dashboard/components/ui/Card';
import Badge from '../dashboard/components/ui/Badge';
import { supabase } from '../../common/config/supabase';
import { getUserById } from '../../common/services/userService';
import { getClientSuperAccounts, getClientFinancialProducts } from '../../common/services/productService';
import { getBeneficiariesByProduct } from '../../common/services/beneficiaryService';
import { unassignClient } from '../../common/services/advisorService';
import { getCurrentUser } from '../../common/services/authService';
import { useToast } from '../../common/context/ToastContext';

const AdvisorClientDetail = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [client, setClient] = useState<any>(null);
  const [superAccounts, setSuperAccounts] = useState<any[]>([]);
  const [financialProducts, setFinancialProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products'>('overview');
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  const [productBeneficiaries, setProductBeneficiaries] = useState<Record<string, any[]>>({});
  const [isClientAssignedToMe, setIsClientAssignedToMe] = useState(false);

  useEffect(() => {
    const fetchClientData = async () => {
      if (!clientId) {
        navigate('/advisor/clients');
        return;
      }

      try {
        setIsLoading(true);

        const [clientData, superData, productsData] = await Promise.all([
          getUserById(clientId),
          getClientSuperAccounts(clientId),
          getClientFinancialProducts(clientId)
        ]);

        if (!clientData) {
          showToast('Client not found', 'error');
          navigate('/advisor/clients');
          return;
        }

        setClient(clientData);
        setSuperAccounts(superData || []);
        setFinancialProducts(productsData || []);

        // Check if client is assigned to current advisor
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.role === 'advisor') {
          const { data: assignment } = await supabase
            .from('advisor_client_assignments')
            .select('advisor_id')
            .eq('client_id', clientId)
            .eq('advisor_id', currentUser.id)
            .maybeSingle();
          
          setIsClientAssignedToMe(!!assignment);
        }

      } catch (error) {
        console.error('Error fetching client data:', error);
        showToast('Failed to load client data', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, [clientId, navigate, showToast]);

  const totalSuper = superAccounts.reduce((sum, acc) => sum + (parseFloat(acc.current_balance) || 0), 0);
  const totalProducts = financialProducts.reduce((sum, prod) => sum + (prod.current_value || 0), 0);
  const totalPortfolio = totalSuper + totalProducts;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const toggleProductExpansion = async (productId: string, productType: 'superannuation' | 'financial_product') => {
    const isExpanded = expandedProducts[productId];
    
    setExpandedProducts(prev => ({ ...prev, [productId]: !isExpanded }));
    
    // Fetch beneficiaries if expanding and not already loaded
    if (!isExpanded && !productBeneficiaries[productId]) {
      try {
        const beneficiaries = await getBeneficiariesByProduct(productType, productId);
        setProductBeneficiaries(prev => ({ ...prev, [productId]: beneficiaries }));
      } catch (error) {
        console.error('Error fetching beneficiaries:', error);
      }
    }
  };

  const handleUnassignClient = async () => {
    if (!clientId || !client) return;

    const confirmed = window.confirm(
      `Are you sure you want to unassign ${client.full_name}? They will become an unassigned client.`
    );

    if (!confirmed) return;

    try {
      const result = await unassignClient(clientId);
      
      if (result.success) {
        showToast(`${client.full_name} has been unassigned successfully`, 'success');
        // Navigate back to clients list after unassigning
        navigate('/advisor/clients');
      } else {
        showToast(result.error || 'Failed to unassign client', 'error');
      }
    } catch (error) {
      console.error('Error unassigning client:', error);
      showToast('An error occurred while unassigning client', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-gray-600">Loading client details...</p>
        </div>
      </div>
    );
  }

  if (!client) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'products', label: 'Products & Accounts', icon: DollarSign }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/advisor/clients')}
            className="flex items-center gap-2 text-gray-600 hover:text-brand transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Clients</span>
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{client.full_name}</h1>
              <p className="text-gray-600">Client ID: {client.username}</p>
            </div>
            {isClientAssignedToMe && (
              <button
                onClick={handleUnassignClient}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>Unassign Client</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Portfolio</span>
              <DollarSign className="w-5 h-5 text-brand" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalPortfolio)}</div>
            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+5.2% this year</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Superannuation</span>
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalSuper)}</div>
            <div className="text-xs text-gray-600 mt-1">{superAccounts.length} account{superAccounts.length !== 1 ? 's' : ''}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Investments</span>
              <PieChart className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalProducts)}</div>
            <div className="text-xs text-gray-600 mt-1">{financialProducts.length} product{financialProducts.length !== 1 ? 's' : ''}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Risk Profile</span>
              <Shield className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-lg font-bold text-gray-900 capitalize">{client.risk_profile || 'Not Set'}</div>
            <Badge variant="info" size="sm" className="mt-2 capitalize">
              {client.risk_profile || 'Assessment Needed'}
            </Badge>
          </Card>
        </div>

        {/* Tabs */}
        <Card className="mb-6">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-brand text-brand'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Full Name</label>
                      <p className="mt-1 text-gray-900 font-medium">{client.full_name}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                      <div className="mt-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900">{formatDate(client.date_of_birth)}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <div className="mt-1 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <a href={`mailto:${client.email}`} className="text-brand hover:text-brand-deep">
                          {client.email}
                        </a>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <div className="mt-1 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <a href={`tel:${client.phone}`} className="text-brand hover:text-brand-deep">
                          {client.phone || 'Not provided'}
                        </a>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-600">Residential Address</label>
                      <div className="mt-1 flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                          {client.address_line1 && <p className="text-gray-900">{client.address_line1}</p>}
                          {client.address_line2 && <p className="text-gray-900">{client.address_line2}</p>}
                          {(client.city || client.state || client.postcode) && (
                            <p className="text-gray-900">
                              {[client.city, client.state, client.postcode].filter(Boolean).join(', ')}
                            </p>
                          )}
                          {client.country && <p className="text-gray-900">{client.country}</p>}
                          {!client.address_line1 && (
                            <p className="text-gray-500 italic">No address on file</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Financial Profile */}
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Financial Profile</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Tax File Number (TFN)</label>
                      <p className="mt-1 text-gray-900 font-mono">
                        {client.tfn ? `••• ••• ${client.tfn.slice(-3)}` : 'Not provided'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        <FileText className="w-3 h-3 inline mr-1" />
                        Confidential - Advisor access only
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Medicare Number</label>
                      <p className="mt-1 text-gray-900 font-mono">
                        {client.medicare_number || 'Not provided'}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Employment Status</label>
                      <p className="mt-1 text-gray-900 capitalize">{client.employment_status || 'Not specified'}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Occupation</label>
                      <p className="mt-1 text-gray-900">{client.occupation || 'Not specified'}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Income Bracket</label>
                      <p className="mt-1 text-gray-900">{client.income_bracket || 'Not disclosed'}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Risk Tolerance</label>
                      <Badge variant="info" className="mt-1 capitalize">
                        {client.risk_profile || 'Not assessed'}
                      </Badge>
                    </div>
                  </div>
                </Card>

                {/* Advisor Notes */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Advisor Notes</h2>
                    <Edit className="w-5 h-5 text-gray-400" />
                  </div>
                  <textarea
                    placeholder="Add private notes about this client (only visible to advisors)..."
                    className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand"
                    defaultValue=""
                  />
                  <div className="mt-3 flex justify-end">
                    <button 
                      onClick={() => showToast('Notes saved successfully', 'success')}
                      className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-deep transition-colors"
                    >
                      Save Notes
                    </button>
                  </div>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Account Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Account Active</span>
                      <Badge variant="success">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">KYC Verified</span>
                      <Badge variant="success">Verified</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Documents</span>
                      <Badge variant="success">Complete</Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Account Details</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">Client Since</span>
                      <p className="font-medium text-gray-900 mt-1">{formatDate(client.created_at)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Login</span>
                      <p className="font-medium text-gray-900 mt-1">
                        {client.last_login ? formatDate(client.last_login) : 'Never'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Products</span>
                      <p className="font-medium text-gray-900 mt-1">
                        {superAccounts.length + financialProducts.length}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Superannuation Accounts */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-blue-600" />
                  Superannuation Accounts
                </h2>
                {superAccounts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No superannuation accounts on file</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {superAccounts.map((account) => (
                      <div key={account.id}>
                        <div 
                          className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg cursor-pointer hover:shadow-md transition-all"
                          onClick={() => toggleProductExpansion(account.id, 'superannuation')}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-gray-900 text-lg">{account.fund_name}</h3>
                                <Badge variant={account.status === 'active' ? 'success' : 'warning'}>
                                  {account.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">Account: {account.account_number}</p>
                              <p className="text-xs text-gray-500">
                                Opened: {formatDate(account.account_opened_date)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-gray-900">{formatCurrency(parseFloat(account.current_balance))}</p>
                              <p className="text-sm text-gray-600 mt-1">Current Balance</p>
                              {expandedProducts[account.id] ? (
                                <ChevronUp className="w-5 h-5 text-gray-400 mt-2 inline" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400 mt-2 inline" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Beneficiaries for this account */}
                        {expandedProducts[account.id] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="ml-6 mt-2 p-4 bg-white border-l-4 border-blue-400 rounded-r-lg"
                          >
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Users className="w-5 h-5 text-blue-600" />
                              Nominated Beneficiaries
                            </h4>
                            {productBeneficiaries[account.id]?.length > 0 ? (
                              <div className="space-y-3">
                                {productBeneficiaries[account.id].map((ben: any) => (
                                  <div key={ben.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                      <p className="font-medium text-gray-900">{ben.full_name}</p>
                                      <p className="text-sm text-gray-600 capitalize">{ben.relationship}</p>
                                    </div>
                                    <Badge variant="success" className="text-lg font-bold">
                                      {ben.allocation_percentage}%
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4">
                                <p className="text-sm text-gray-500 italic mb-3">No beneficiaries nominated for this account</p>
                                <button
                                  onClick={() => showToast('Please call the client to assign beneficiaries for this account', 'info')}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                                >
                                  <PhoneCall className="w-4 h-4" />
                                  <span>Call Client to Assign Beneficiaries</span>
                                </button>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Financial Products */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <PieChart className="w-6 h-6 text-purple-600" />
                  Financial Products
                </h2>
                {financialProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No financial products on file</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {financialProducts.map((product) => (
                      <div key={product.id}>
                        <div 
                          className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg cursor-pointer hover:shadow-md transition-all"
                          onClick={() => toggleProductExpansion(product.id, 'financial_product')}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-gray-900 text-lg">{product.product_name}</h3>
                                <Badge variant="info">{product.product_type}</Badge>
                                <Badge variant={product.status === 'active' ? 'success' : 'warning'}>
                                  {product.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">Code: {product.product_code || product.account_number}</p>
                              <p className="text-xs text-gray-500">
                                Started: {formatDate(product.acquisition_date || product.created_at)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-gray-900">{formatCurrency(product.current_value)}</p>
                              <p className="text-sm text-gray-600 mt-1">Current Value</p>
                              {expandedProducts[product.id] ? (
                                <ChevronUp className="w-5 h-5 text-gray-400 mt-2 inline" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400 mt-2 inline" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Beneficiaries for this product */}
                        {expandedProducts[product.id] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="ml-6 mt-2 p-4 bg-white border-l-4 border-purple-400 rounded-r-lg"
                          >
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Users className="w-5 h-5 text-purple-600" />
                              Nominated Beneficiaries
                            </h4>
                            {productBeneficiaries[product.id]?.length > 0 ? (
                              <div className="space-y-3">
                                {productBeneficiaries[product.id].map((ben: any) => (
                                  <div key={ben.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                      <p className="font-medium text-gray-900">{ben.full_name}</p>
                                      <p className="text-sm text-gray-600 capitalize">{ben.relationship}</p>
                                    </div>
                                    <Badge variant="success" className="text-lg font-bold">
                                      {ben.allocation_percentage}%
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4">
                                <p className="text-sm text-gray-500 italic mb-3">No beneficiaries nominated for this product</p>
                                <button
                                  onClick={() => showToast('Please call the client to assign beneficiaries for this product', 'info')}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                                >
                                  <PhoneCall className="w-4 h-4" />
                                  <span>Call Client to Assign Beneficiaries</span>
                                </button>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdvisorClientDetail;
