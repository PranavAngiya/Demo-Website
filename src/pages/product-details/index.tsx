import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Building2,
  Users,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Check
} from 'lucide-react';
import './styles/product-details.css';
import Button from './components/ui/Button';
import Card from './components/ui/Card';
import Badge from './components/ui/Badge';
import Modal from './components/ui/Modal';
import Input from './components/ui/Input';
import { useToast } from '../../common/context/ToastContext';
import { getCurrentUser } from '../../common/services/authService';
import { getSuperAccountById, type SuperannuationAccount } from '../../common/services/superService';
import { getProductById, type FinancialProduct } from '../../common/services/productService';
import {
  getBeneficiariesByProduct,
  addBeneficiary,
  updateBeneficiary,
  deleteBeneficiary,
  type Beneficiary,
  type BeneficiaryInput
} from '../../common/services/beneficiaryService';

const ProductDetails = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<SuperannuationAccount | FinancialProduct | null>(null);
  const [productType, setProductType] = useState<'superannuation' | 'financial_product'>('superannuation');
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [allocationTotal, setAllocationTotal] = useState(0);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [beneficiaryForm, setBeneficiaryForm] = useState<BeneficiaryInput>({
    product_type: 'superannuation',
    product_id: '',
    full_name: '',
    relationship: '',
    date_of_birth: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postcode: '',
    country: 'Australia',
    tfn: '',
    allocation_percentage: 0,
    beneficiary_type: 'non_binding',
    priority: 'primary',
  });

  // Fetch product and beneficiaries
  useEffect(() => {
    const fetchData = async () => {
      if (!productId) return;
      
      try {
        setIsLoading(true);
        const sessionUser = getCurrentUser();
        if (!sessionUser) {
          navigate('/login');
          return;
        }

        // Try to fetch as superannuation account first
        let productData = await getSuperAccountById(productId);
        let type: 'superannuation' | 'financial_product' = 'superannuation';
        
        // If not found, try as financial product
        if (!productData) {
          productData = await getProductById(productId) as any;
          type = 'financial_product';
        }

        if (!productData) {
          showToast('Product not found', 'error');
          navigate('/client/dashboard');
          return;
        }

        setProduct(productData);
        setProductType(type);

        // Fetch beneficiaries
        const beneficiariesData = await getBeneficiariesByProduct(type, productId);
        setBeneficiaries(beneficiariesData);
        
        // Calculate total allocation
        const total = beneficiariesData.reduce((sum, b) => sum + Number(b.allocation_percentage), 0);
        setAllocationTotal(total);

      } catch (error) {
        console.error('Error fetching product:', error);
        showToast('Failed to load product', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [productId, navigate, showToast]);

  const handleAddBeneficiary = () => {
    if (!productId) return;
    
    setBeneficiaryForm({
      product_type: productType,
      product_id: productId,
      full_name: '',
      relationship: '',
      date_of_birth: '',
      email: '',
      phone: '',
      allocation_percentage: 0,
      beneficiary_type: 'non_binding',
      priority: 'primary',
    });
    setShowAddModal(true);
  };

  const handleEditBeneficiary = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setBeneficiaryForm({
      product_type: beneficiary.product_type,
      product_id: beneficiary.product_id,
      full_name: beneficiary.full_name,
      relationship: beneficiary.relationship,
      date_of_birth: beneficiary.date_of_birth || '',
      email: beneficiary.email || '',
      phone: beneficiary.phone || '',
      allocation_percentage: beneficiary.allocation_percentage,
      beneficiary_type: beneficiary.beneficiary_type,
      priority: beneficiary.priority,
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setShowDeleteModal(true);
  };

  const handleSaveAdd = async () => {
    const sessionUser = getCurrentUser();
    if (!sessionUser) return;

    // Validate allocation
    if (beneficiaryForm.allocation_percentage <= 0 || beneficiaryForm.allocation_percentage > 100) {
      showToast('Allocation must be between 0 and 100%', 'error');
      return;
    }

    const potentialTotal = allocationTotal + beneficiaryForm.allocation_percentage;
    if (potentialTotal > 100) {
      showToast(
        `Cannot add beneficiary. Current total: ${allocationTotal}%, would become: ${potentialTotal}%`,
        'error'
      );
      return;
    }

    setIsSaving(true);
    const result = await addBeneficiary(beneficiaryForm, sessionUser.id);
    setIsSaving(false);

    if (result.success && result.beneficiary) {
      setBeneficiaries([...beneficiaries, result.beneficiary]);
      setAllocationTotal(allocationTotal + result.beneficiary.allocation_percentage);
      setShowAddModal(false);
      showToast('Beneficiary added successfully!', 'success');
    } else {
      showToast(result.error || 'Failed to add beneficiary', 'error');
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedBeneficiary) return;
    
    const sessionUser = getCurrentUser();
    if (!sessionUser) return;

    // Validate allocation
    if (beneficiaryForm.allocation_percentage <= 0 || beneficiaryForm.allocation_percentage > 100) {
      showToast('Allocation must be between 0 and 100%', 'error');
      return;
    }

    const otherBeneficiariesTotal = allocationTotal - selectedBeneficiary.allocation_percentage;
    const potentialTotal = otherBeneficiariesTotal + beneficiaryForm.allocation_percentage;
    
    if (potentialTotal > 100) {
      showToast(
        `Cannot update. Other beneficiaries total: ${otherBeneficiariesTotal}%, would become: ${potentialTotal}%`,
        'error'
      );
      return;
    }

    setIsSaving(true);
    const result = await updateBeneficiary(selectedBeneficiary.id, beneficiaryForm, sessionUser.id);
    setIsSaving(false);

    if (result.success && result.beneficiary) {
      const updated = beneficiaries.map(b => 
        b.id === result.beneficiary!.id ? result.beneficiary! : b
      );
      setBeneficiaries(updated);
      const newTotal = updated.reduce((sum, b) => sum + Number(b.allocation_percentage), 0);
      setAllocationTotal(newTotal);
      setShowEditModal(false);
      setSelectedBeneficiary(null);
      showToast('Beneficiary updated successfully!', 'success');
    } else {
      showToast(result.error || 'Failed to update beneficiary', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedBeneficiary) return;
    
    const sessionUser = getCurrentUser();
    if (!sessionUser) return;

    setIsSaving(true);
    const result = await deleteBeneficiary(selectedBeneficiary.id, sessionUser.id);
    setIsSaving(false);

    if (result.success) {
      const updated = beneficiaries.filter(b => b.id !== selectedBeneficiary.id);
      setBeneficiaries(updated);
      const newTotal = updated.reduce((sum, b) => sum + Number(b.allocation_percentage), 0);
      setAllocationTotal(newTotal);
      setShowDeleteModal(false);
      setSelectedBeneficiary(null);
      showToast('Beneficiary removed successfully!', 'success');
    } else {
      showToast(result.error || 'Failed to remove beneficiary', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <p className="text-gray-600">Product not found</p>
          <Button onClick={() => navigate('/client/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const isSuperAccount = 'fund_name' in product;
  const isComplete = allocationTotal === 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Back Button */}
        <Button
          variant="secondary"
          onClick={() => navigate('/client/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Product Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {isSuperAccount ? product.fund_name : product.product_name}
                </h1>
                <Badge variant="primary">
                  {isSuperAccount ? 'Superannuation' : product.product_type}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Current Balance</p>
                <p className="text-3xl font-bold text-primary">
                  ${Number((product as any).current_balance || (product as any).current_value).toLocaleString('en-AU', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            {/* Product Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isSuperAccount && (
                <>
                  <div>
                    <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                      <Building2 className="w-4 h-4" />
                      Fund ABN
                    </p>
                    <p className="font-semibold">{product.fund_abn || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4" />
                      Investment Strategy
                    </p>
                    <p className="font-semibold capitalize">{product.investment_strategy || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4" />
                      Annual Return
                    </p>
                    <p className="font-semibold">{product.annual_return_rate ? `${product.annual_return_rate}%` : 'N/A'}</p>
                  </div>
                </>
              )}
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4" />
                  {isSuperAccount ? 'Account Opened' : 'Acquisition Date'}
                </p>
                <p className="font-semibold">
                  {new Date(isSuperAccount ? product.account_opened_date : product.acquisition_date || '').toLocaleDateString('en-AU')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <Badge variant={product.is_active ? 'success' : 'secondary'}>
                  {product.status}
                </Badge>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Beneficiaries Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Beneficiaries
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Manage who receives this product in the event of your passing
                </p>
              </div>
              <Button onClick={handleAddBeneficiary} disabled={isComplete}>
                <Plus className="w-4 h-4 mr-2" />
                Add Beneficiary
              </Button>
            </div>

            {/* Allocation Summary */}
            <div className={`mb-6 p-4 rounded-lg ${
              isComplete ? 'bg-green-50 border-2 border-green-200' : 
              allocationTotal > 0 ? 'bg-yellow-50 border-2 border-yellow-200' : 
              'bg-blue-50 border-2 border-blue-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isComplete ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : allocationTotal > 0 ? (
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                  )}
                  <span className="font-semibold">
                    Total Allocation: {allocationTotal}%
                  </span>
                </div>
                {isComplete ? (
                  <Badge variant="success">Complete</Badge>
                ) : allocationTotal > 0 ? (
                  <Badge variant="warning">Incomplete</Badge>
                ) : (
                  <Badge variant="info">No Beneficiaries</Badge>
                )}
              </div>
              {!isComplete && allocationTotal > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  You have {100 - allocationTotal}% remaining to allocate
                </p>
              )}
            </div>

            {/* Beneficiaries List */}
            {beneficiaries.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-900 mb-2">No Beneficiaries Set</p>
                <p className="text-gray-600 mb-6">
                  Add beneficiaries to specify who should receive this product
                </p>
                <Button onClick={handleAddBeneficiary}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Beneficiary
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {beneficiaries.map((beneficiary, index) => (
                  <motion.div
                    key={beneficiary.id}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {beneficiary.full_name}
                          </h3>
                          <Badge variant={beneficiary.beneficiary_type === 'binding' ? 'primary' : 'secondary'}>
                            {beneficiary.beneficiary_type === 'binding' ? 'Binding' : 'Non-Binding'}
                          </Badge>
                          {beneficiary.priority === 'contingent' && (
                            <Badge variant="info">Contingent</Badge>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          {/* Personal Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <p className="text-gray-700">
                              <span className="font-medium">Relationship:</span> {beneficiary.relationship}
                            </p>
                            {beneficiary.date_of_birth && (
                              <p className="text-gray-700">
                                <span className="font-medium">DOB:</span> {new Date(beneficiary.date_of_birth).toLocaleDateString('en-AU')}
                              </p>
                            )}
                          </div>
                          
                          {/* Contact Details */}
                          {(beneficiary.email || beneficiary.phone) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                              {beneficiary.email && <p>✉ {beneficiary.email}</p>}
                              {beneficiary.phone && <p>📞 {beneficiary.phone}</p>}
                            </div>
                          )}
                          
                          {/* Address */}
                          {beneficiary.address_line1 && (
                            <div className="text-sm text-gray-600">
                              <p className="font-medium text-gray-700 mb-1">Address:</p>
                              <p>{beneficiary.address_line1}</p>
                              {beneficiary.address_line2 && <p>{beneficiary.address_line2}</p>}
                              <p>
                                {beneficiary.city && `${beneficiary.city}, `}
                                {beneficiary.state && `${beneficiary.state} `}
                                {beneficiary.postcode && beneficiary.postcode}
                              </p>
                              {beneficiary.country && beneficiary.country !== 'Australia' && (
                                <p>{beneficiary.country}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {beneficiary.allocation_percentage}%
                          </p>
                          <p className="text-xs text-gray-600">Allocation</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEditBeneficiary(beneficiary)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteClick(beneficiary)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Add Beneficiary Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Beneficiary - Nomination Form"
        >
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {/* Important Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Important Information</p>
                  <p>Please ensure all information is accurate. This nomination will determine who receives your superannuation benefit in the event of your death.</p>
                </div>
              </div>
            </div>

            {/* Personal Details Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Legal Name <span className="text-red-600">*</span>
                  </label>
                  <Input
                    value={beneficiaryForm.full_name}
                    onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, full_name: e.target.value })}
                    placeholder="As per legal identification"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Must match government-issued ID</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship to You <span className="text-red-600">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                    value={beneficiaryForm.relationship}
                    onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, relationship: e.target.value })}
                    required
                  >
                    <option value="">Select relationship...</option>
                    <option value="Spouse">Spouse</option>
                    <option value="De facto partner">De facto partner</option>
                    <option value="Child">Child</option>
                    <option value="Step-child">Step-child</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Other dependent">Other dependent</option>
                    <option value="Legal personal representative">Legal personal representative (estate)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth <span className="text-red-600">*</span>
                  </label>
                  <Input
                    type="date"
                    value={beneficiaryForm.date_of_birth}
                    onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, date_of_birth: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={beneficiaryForm.email}
                    onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, email: e.target.value })}
                    placeholder="example@email.com"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={beneficiaryForm.phone}
                    onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, phone: e.target.value })}
                    placeholder="04XX XXX XXX"
                  />
                  <p className="text-xs text-gray-500 mt-1">Australian mobile or landline</p>
                </div>
              </div>
            </div>

            {/* Residential Address Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Residential Address
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address <span className="text-red-600">*</span>
                  </label>
                  <Input
                    value={beneficiaryForm.address_line1}
                    onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, address_line1: e.target.value })}
                    placeholder="Unit/Number and Street"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 2
                  </label>
                  <Input
                    value={beneficiaryForm.address_line2}
                    onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, address_line2: e.target.value })}
                    placeholder="Additional address details (optional)"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Suburb/City <span className="text-red-600">*</span>
                    </label>
                    <Input
                      value={beneficiaryForm.city}
                      onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, city: e.target.value })}
                      placeholder="Sydney"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State <span className="text-red-600">*</span>
                    </label>
                    <select
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                      value={beneficiaryForm.state}
                      onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, state: e.target.value })}
                      required
                    >
                      <option value="">Select...</option>
                      <option value="NSW">NSW</option>
                      <option value="VIC">VIC</option>
                      <option value="QLD">QLD</option>
                      <option value="WA">WA</option>
                      <option value="SA">SA</option>
                      <option value="TAS">TAS</option>
                      <option value="ACT">ACT</option>
                      <option value="NT">NT</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postcode <span className="text-red-600">*</span>
                    </label>
                    <Input
                      type="text"
                      value={beneficiaryForm.postcode}
                      onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, postcode: e.target.value })}
                      placeholder="2000"
                      maxLength={4}
                      pattern="[0-9]{4}"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <Input
                      value={beneficiaryForm.country}
                      onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, country: e.target.value })}
                      placeholder="Australia"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tax Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Tax Information (Optional)
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax File Number (TFN)
                  </label>
                  <Input
                    type="text"
                    value={beneficiaryForm.tfn}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 9) {
                        setBeneficiaryForm({ ...beneficiaryForm, tfn: value });
                      }
                    }}
                    placeholder="XXX XXX XXX"
                    maxLength={11}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Providing TFN is voluntary but may help reduce tax on benefits. Protected under Privacy Act 1988.
                  </p>
                </div>
              </div>
            </div>

            {/* Nomination Details Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Nomination Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomination Type <span className="text-red-600">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                    value={beneficiaryForm.beneficiary_type}
                    onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, beneficiary_type: e.target.value as 'binding' | 'non_binding' })}
                    required
                  >
                    <option value="non_binding">Non-Binding Nomination</option>
                    <option value="binding">Binding Death Benefit Nomination</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {beneficiaryForm.beneficiary_type === 'binding' 
                      ? 'Legally binding - must be reviewed every 3 years'
                      : 'Trustees retain discretion on benefit distribution'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority <span className="text-red-600">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                    value={beneficiaryForm.priority}
                    onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, priority: e.target.value as 'primary' | 'contingent' })}
                    required
                  >
                    <option value="primary">Primary Beneficiary</option>
                    <option value="contingent">Contingent Beneficiary</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {beneficiaryForm.priority === 'primary' 
                      ? 'Receives benefit share first'
                      : 'Receives benefit only if primary is unavailable'}
                  </p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allocation Percentage <span className="text-red-600">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min="0"
                      max={100 - allocationTotal}
                      step="0.01"
                      value={beneficiaryForm.allocation_percentage}
                      onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, allocation_percentage: Number(e.target.value) })}
                      required
                      className="flex-1"
                    />
                    <span className="text-2xl font-bold text-gray-700">%</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">
                      Available to allocate: <span className="font-semibold text-primary">{100 - allocationTotal}%</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Total allocated: <span className="font-semibold">{allocationTotal}%</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Declaration */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-700">
                <span className="font-semibold">Declaration:</span> By submitting this nomination, I declare that the information provided is true and correct. I understand that this nomination will take effect upon submission and may be reviewed or revoked at any time. For binding nominations, I acknowledge this must be reviewed every 3 years to remain valid.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={() => setShowAddModal(false)}
                className="flex-1"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveAdd}
                className="flex-1"
                disabled={isSaving || !beneficiaryForm.full_name || !beneficiaryForm.relationship || 
                  !beneficiaryForm.date_of_birth || !beneficiaryForm.address_line1 || 
                  !beneficiaryForm.city || !beneficiaryForm.state || !beneficiaryForm.postcode}
              >
                {isSaving ? 'Submitting...' : 'Submit Nomination'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit Beneficiary Modal - Same comprehensive form as Add */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Beneficiary - Nomination Form"
        >
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {/* Note: Editing existing nomination */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900">
                  <p className="font-semibold mb-1">Editing Beneficiary Nomination</p>
                  <p>You are updating an existing beneficiary nomination. Ensure all information remains accurate and current.</p>
                </div>
              </div>
            </div>

            {/* Personal Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Legal Name <span className="text-red-600">*</span>
                  </label>
                  <Input
                    value={beneficiaryForm.full_name}
                    onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, full_name: e.target.value })}
                    placeholder="As per legal identification"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship to You <span className="text-red-600">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                    value={beneficiaryForm.relationship}
                    onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, relationship: e.target.value })}
                    required
                  >
                    <option value="">Select relationship...</option>
                    <option value="Spouse">Spouse</option>
                    <option value="De facto partner">De facto partner</option>
                    <option value="Child">Child</option>
                    <option value="Step-child">Step-child</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Other dependent">Other dependent</option>
                    <option value="Legal personal representative">Legal personal representative (estate)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth <span className="text-red-600">*</span>
                  </label>
                  <Input
                    type="date"
                    value={beneficiaryForm.date_of_birth}
                    onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, date_of_birth: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <Input
                    type="email"
                    value={beneficiaryForm.email}
                    onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, email: e.target.value })}
                    placeholder="example@email.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <Input
                    type="tel"
                    value={beneficiaryForm.phone}
                    onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, phone: e.target.value })}
                    placeholder="04XX XXX XXX"
                  />
                </div>
              </div>
            </div>

            {/* Residential Address */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Residential Address</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address <span className="text-red-600">*</span>
                  </label>
                  <Input
                    value={beneficiaryForm.address_line1}
                    onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, address_line1: e.target.value })}
                    placeholder="Unit/Number and Street"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                  <Input
                    value={beneficiaryForm.address_line2}
                    onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, address_line2: e.target.value })}
                    placeholder="Additional address details (optional)"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Suburb/City <span className="text-red-600">*</span>
                    </label>
                    <Input
                      value={beneficiaryForm.city}
                      onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, city: e.target.value })}
                      placeholder="Sydney"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State <span className="text-red-600">*</span>
                    </label>
                    <select
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                      value={beneficiaryForm.state}
                      onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, state: e.target.value })}
                      required
                    >
                      <option value="">Select...</option>
                      <option value="NSW">NSW</option>
                      <option value="VIC">VIC</option>
                      <option value="QLD">QLD</option>
                      <option value="WA">WA</option>
                      <option value="SA">SA</option>
                      <option value="TAS">TAS</option>
                      <option value="ACT">ACT</option>
                      <option value="NT">NT</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postcode <span className="text-red-600">*</span>
                    </label>
                    <Input
                      type="text"
                      value={beneficiaryForm.postcode}
                      onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, postcode: e.target.value })}
                      placeholder="2000"
                      maxLength={4}
                      pattern="[0-9]{4}"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <Input
                      value={beneficiaryForm.country}
                      onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, country: e.target.value })}
                      placeholder="Australia"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tax Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Tax Information (Optional)</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax File Number (TFN)</label>
                  <Input
                    type="text"
                    value={beneficiaryForm.tfn}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 9) {
                        setBeneficiaryForm({ ...beneficiaryForm, tfn: value });
                      }
                    }}
                    placeholder="XXX XXX XXX"
                    maxLength={11}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Providing TFN is voluntary but may help reduce tax on benefits. Protected under Privacy Act 1988.
                  </p>
                </div>
              </div>
            </div>

            {/* Nomination Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Nomination Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomination Type <span className="text-red-600">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                    value={beneficiaryForm.beneficiary_type}
                    onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, beneficiary_type: e.target.value as 'binding' | 'non_binding' })}
                    required
                  >
                    <option value="non_binding">Non-Binding Nomination</option>
                    <option value="binding">Binding Death Benefit Nomination</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {beneficiaryForm.beneficiary_type === 'binding' 
                      ? 'Legally binding - must be reviewed every 3 years'
                      : 'Trustees retain discretion on benefit distribution'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority <span className="text-red-600">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                    value={beneficiaryForm.priority}
                    onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, priority: e.target.value as 'primary' | 'contingent' })}
                    required
                  >
                    <option value="primary">Primary Beneficiary</option>
                    <option value="contingent">Contingent Beneficiary</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {beneficiaryForm.priority === 'primary' 
                      ? 'Receives benefit share first'
                      : 'Receives benefit only if primary is unavailable'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allocation Percentage <span className="text-red-600">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min="0"
                      max={selectedBeneficiary ? 100 - allocationTotal + (selectedBeneficiary.allocation_percentage || 0) : 100}
                      step="0.01"
                      value={beneficiaryForm.allocation_percentage}
                      onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, allocation_percentage: Number(e.target.value) })}
                      required
                      className="flex-1"
                    />
                    <span className="text-2xl font-bold text-gray-700">%</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">
                      Available: <span className="font-semibold text-primary">
                        {selectedBeneficiary ? (100 - allocationTotal + (selectedBeneficiary.allocation_percentage || 0)).toFixed(2) : 100}%
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Total allocated: <span className="font-semibold">{allocationTotal}%</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={() => setShowEditModal(false)}
                className="flex-1"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveEdit}
                className="flex-1"
                disabled={isSaving || !beneficiaryForm.full_name || !beneficiaryForm.relationship || 
                  !beneficiaryForm.date_of_birth || !beneficiaryForm.address_line1 || 
                  !beneficiaryForm.city || !beneficiaryForm.state || !beneficiaryForm.postcode}
              >
                {isSaving ? 'Updating...' : 'Update Nomination'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Remove Beneficiary"
        >
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Are you sure?
            </h3>
            <p className="text-gray-600 mb-6">
              This will remove <strong>{selectedBeneficiary?.full_name}</strong> as a beneficiary.
              This action will be logged but can be undone by re-adding them.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDelete}
                className="flex-1"
                disabled={isSaving}
              >
                {isSaving ? 'Removing...' : 'Yes, Remove'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ProductDetails;
