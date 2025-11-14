import { useState, useEffect, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Briefcase, Calendar, Hash, Save, X, Edit2 } from 'lucide-react';
import './styles/profile.css';
import Button from './components/ui/Button';
import Input from './components/ui/Input';
import Card from './components/ui/Card';
import Badge from './components/ui/Badge';
import { getCurrentUser } from '../../common/services/authService';
import { getUserById, updateUserProfile, type User as DBUser } from '../../common/services/userService';
import { useToast } from '../../common/context/ToastContext';

const Profile = () => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<DBUser | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postcode: '',
    employment_status: '',
    occupation: '',
  });

  // Original data for cancel
  const [originalData, setOriginalData] = useState(formData);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const sessionUser = getCurrentUser();
        if (!sessionUser) {
          showToast('Please login to view profile', 'error');
          window.location.href = '/login';
          return;
        }

        const userData = await getUserById(sessionUser.id);
        if (userData) {
          setUser(userData);
          
          const data = {
            email: userData.email || '',
            phone: userData.phone || '',
            address_line1: userData.address_line1 || '',
            address_line2: userData.address_line2 || '',
            city: userData.city || '',
            state: userData.state || '',
            postcode: userData.postcode || '',
            employment_status: userData.employment_status || '',
            occupation: userData.occupation || '',
          };
          
          setFormData(data);
          setOriginalData(data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        showToast('Failed to load profile', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [showToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      setIsSaving(true);
      const result = await updateUserProfile(user.id, formData);
      
      if (result.success) {
        showToast('Profile updated successfully!', 'success');
        setOriginalData(formData);
        setIsEditing(false);
        
        // Refresh user data
        const updatedUser = await getUserById(user.id);
        if (updatedUser) {
          setUser(updatedUser);
        }
      } else {
        showToast(result.error || 'Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('An error occurred while updating profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <p className="text-gray-600 text-center">Unable to load profile data</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your personal information</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8">
            <form onSubmit={handleSave}>
              {/* User Header */}
              <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {user.full_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{user.full_name}</h2>
                    <Badge variant="primary" className="mt-2">
                      {user.role === 'client' ? 'Client' : 'Advisor'}
                    </Badge>
                  </div>
                </div>
                
                {!isEditing ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isSaving}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Account Information (Read-only) */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Hash className="w-5 h-5 text-gray-600" />
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                      {user.username}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      {new Date(user.date_of_birth).toLocaleDateString('en-AU')}
                    </div>
                  </div>
                  {user.tfn && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tax File Number
                      </label>
                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-mono">
                        ••• ••• {user.tfn.slice(-3)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information (Editable) */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-gray-600" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="0412 345 678"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Address (Editable) */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  Address
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <Input
                      name="address_line1"
                      value={formData.address_line1}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apartment, Suite, etc. (Optional)
                    </label>
                    <Input
                      name="address_line2"
                      value={formData.address_line2}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Unit 5"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <Input
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Melbourne"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <Input
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="VIC"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postcode
                      </label>
                      <Input
                        name="postcode"
                        value={formData.postcode}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="3000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Employment Information (Editable) */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-gray-600" />
                  Employment Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Occupation
                    </label>
                    <Input
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Software Engineer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employment Status
                    </label>
                    <Input
                      name="employment_status"
                      value={formData.employment_status}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Full-time"
                    />
                  </div>
                </div>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
