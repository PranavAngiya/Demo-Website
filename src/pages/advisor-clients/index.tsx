import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, UserPlus, Search, Eye, TrendingUp } from 'lucide-react';
import './styles/advisor-clients.css';
import Button from './components/ui/Button';
import Card from './components/ui/Card';
import Badge from './components/ui/Badge';
import Input from './components/ui/Input';
import { useToast } from '../../common/context/ToastContext';
import { getCurrentUser } from '../../common/services/authService';
import { getAllClients, type UserWithAdvisor } from '../../common/services/userService';
import { assignClientToAdvisor, getAdvisorStats } from '../../common/services/advisorService';

type FilterType = 'all' | 'assigned' | 'unassigned';

const AdvisorClients = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState<UserWithAdvisor[]>([]);
  const [filteredClients, setFilteredClients] = useState<UserWithAdvisor[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ assignedClients: 0, unassignedClients: 0, totalClients: 0 });
  const [sessionUser, setSessionUser] = useState(getCurrentUser());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const user = getCurrentUser();
        
        if (!user || user.role !== 'advisor') {
          navigate('/login');
          return;
        }

        setSessionUser(user);

        // Fetch all clients
        const allClients = await getAllClients();
        setClients(allClients);

        // Fetch stats
        const advisorStats = await getAdvisorStats(user.id);
        setStats(advisorStats);

      } catch (error) {
        console.error('Error fetching clients:', error);
        showToast('Failed to load clients', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate, showToast]);

  // Filter and search clients
  useEffect(() => {
    let result = [...clients];

    // Apply filter
    if (filter === 'assigned') {
      result = result.filter(c => c.advisor_id === sessionUser?.id);
    } else if (filter === 'unassigned') {
      result = result.filter(c => !c.advisor_id);
    }

    // Apply search
    if (searchTerm) {
      result = result.filter(c =>
        c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredClients(result);
  }, [clients, filter, searchTerm, sessionUser]);

  const handleAssignClient = async (clientId: string, clientName: string) => {
    if (!sessionUser) return;

    const result = await assignClientToAdvisor(clientId, sessionUser.id);

    if (result.success) {
      showToast(`${clientName} assigned successfully!`, 'success');
      
      // Refresh data
      const allClients = await getAllClients();
      setClients(allClients);
      const advisorStats = await getAdvisorStats(sessionUser.id);
      setStats(advisorStats);
    } else {
      showToast(result.error || 'Failed to assign client', 'error');
    }
  };

  const handleViewClient = (clientId: string) => {
    navigate(`/advisor/clients/${clientId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-24">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Client Management</h1>
          <p className="text-gray-600">View and manage your client assignments</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 border-2 border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">My Clients</p>
                  <p className="text-3xl font-bold text-primary">{stats.assignedClients}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 border-2 border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Unassigned</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.unassignedClients}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Clients</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalClients}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, email, or username..."
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'primary' : 'secondary'}
                  onClick={() => setFilter('all')}
                  size="sm"
                >
                  All ({clients.length})
                </Button>
                <Button
                  variant={filter === 'assigned' ? 'primary' : 'secondary'}
                  onClick={() => setFilter('assigned')}
                  size="sm"
                >
                  My Clients ({stats.assignedClients})
                </Button>
                <Button
                  variant={filter === 'unassigned' ? 'primary' : 'secondary'}
                  onClick={() => setFilter('unassigned')}
                  size="sm"
                >
                  Unassigned ({stats.unassignedClients})
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Clients List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="overflow-hidden">
            {filteredClients.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Clients Found</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Try adjusting your search' : 'No clients match the selected filter'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Client</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Contact</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Risk Profile</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Advisor</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredClients.map((client, index) => {
                      const isMyClient = client.advisor_id === sessionUser?.id;
                      const isUnassigned = !client.advisor_id;

                      return (
                        <motion.tr
                          key={client.id}
                          className="hover:bg-gray-50 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-gray-900">{client.full_name}</p>
                              <p className="text-sm text-gray-600">@{client.username}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="text-gray-900">{client.email}</p>
                              {client.phone && <p className="text-gray-600">{client.phone}</p>}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="info" className="capitalize">
                              {client.risk_profile || 'Not set'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={isMyClient ? 'success' : isUnassigned ? 'warning' : 'secondary'}>
                              {isMyClient ? 'My Client' : isUnassigned ? 'Unassigned' : 'Assigned'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-900">
                              {client.advisor_name || '-'}
                            </p>
                            {client.assigned_at && (
                              <p className="text-xs text-gray-600">
                                Since {new Date(client.assigned_at).toLocaleDateString('en-AU')}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              {isUnassigned && (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={() => handleAssignClient(client.id, client.full_name)}
                                >
                                  <UserPlus className="w-4 h-4 mr-1" />
                                  Assign to Me
                                </Button>
                              )}
                              {(isMyClient || isUnassigned) && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleViewClient(client.id)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdvisorClients;
