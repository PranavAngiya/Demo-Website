import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Phone, Search, Filter, Eye, FileText,
  ChevronLeft, ChevronRight, Copy
} from 'lucide-react';
import { supabase } from '../../common/config/supabase';
import { getCurrentUser } from '../../common/services/authService';
import { useToast } from '../../common/context/ToastContext';

interface CallSession {
  id: string;
  client_id: string;
  product_type: string;
  product_id: string;
  status: string;
  initiated_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  twofa_status: string;
  final_action: string | null;
  client_name?: string;
  product_name?: string;
}

const AdvisorCallHistory = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [callSessions, setCallSessions] = useState<CallSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<CallSession[]>([]);
  const [selectedCall, setSelectedCall] = useState<CallSession | null>(null);
  const [transcripts, setTranscripts] = useState<any[]>([]);
  const [draftFields, setDraftFields] = useState<any>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [outcomeFilter, setOutcomeFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'client'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 20;

  useEffect(() => {
    fetchCallSessions();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [callSessions, searchQuery, statusFilter, outcomeFilter, dateRange, sortBy, sortOrder]);

  const fetchCallSessions = async () => {
    try {
      setIsLoading(true);
      const user = getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: sessions, error } = await supabase
        .from('call_sessions')
        .select('*')
        .eq('advisor_id', user.id)
        .order('initiated_at', { ascending: false });

      if (error) throw error;

      const sessionsWithDetails = await Promise.all(
        (sessions || []).map(async (session) => {
          const { data: client } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', session.client_id)
            .maybeSingle();

          let productName = 'Unknown Product';
          if (session.product_type === 'superannuation') {
            const { data: product } = await supabase
              .from('superannuation_accounts')
              .select('fund_name')
              .eq('id', session.product_id)
              .maybeSingle();
            productName = product?.fund_name || 'Superannuation Account';
          } else {
            const { data: product } = await supabase
              .from('financial_products')
              .select('product_name')
              .eq('id', session.product_id)
              .maybeSingle();
            productName = product?.product_name || 'Financial Product';
          }

          return {
            ...session,
            client_name: client?.full_name || 'Unknown Client',
            product_name: productName,
          };
        })
      );

      setCallSessions(sessionsWithDetails);
    } catch (error) {
      console.error('Error fetching call sessions:', error);
      showToast('Failed to load call history', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...callSessions];

    if (searchQuery) {
      filtered = filtered.filter(
        (s) =>
          s.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.product_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    if (outcomeFilter !== 'all') {
      filtered = filtered.filter((s) => s.final_action === outcomeFilter);
    }

    if (dateRange.start) {
      filtered = filtered.filter((s) => new Date(s.initiated_at) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      filtered = filtered.filter((s) => new Date(s.initiated_at) <= new Date(dateRange.end));
    }

    filtered.sort((a, b) => {
      let compareValue = 0;
      switch (sortBy) {
        case 'date':
          compareValue = new Date(a.initiated_at).getTime() - new Date(b.initiated_at).getTime();
          break;
        case 'duration':
          compareValue = (a.duration_seconds || 0) - (b.duration_seconds || 0);
          break;
        case 'client':
          compareValue = (a.client_name || '').localeCompare(b.client_name || '');
          break;
      }
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    setFilteredSessions(filtered);
    setCurrentPage(1);
  };

  const handleSort = (column: 'date' | 'duration' | 'client') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const handleViewDetails = async (session: CallSession) => {
    setSelectedCall(session);
    
    const { data: transcriptData } = await supabase
      .from('conversation_transcripts')
      .select('*')
      .eq('call_session_id', session.id)
      .order('sequence_number', { ascending: true });

    setTranscripts(transcriptData || []);

    const { data: draft } = await supabase
      .from('draft_beneficiaries')
      .select('*')
      .eq('call_session_id', session.id)
      .maybeSingle();

    setDraftFields(draft);
    setShowDetailModal(true);
  };

  const copyTranscript = () => {
    const text = transcripts
      .map((t) => `[${new Date(t.timestamp).toLocaleTimeString()}] ${t.speaker === 'ai_bot' ? 'AI' : 'Client'}: ${t.message_text}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    showToast('Transcript copied!', 'success');
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      failed: 'bg-red-100 text-red-700',
      in_progress: 'bg-blue-100 text-blue-700',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getOutcomeBadge = (action: string | null) => {
    if (!action || action === 'none') return <span className="text-gray-500 text-xs">-</span>;
    const colors: Record<string, string> = {
      draft_saved: 'bg-yellow-100 text-yellow-700',
      directly_confirmed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[action] || 'bg-gray-100 text-gray-700'}`}>
        {action.replace('_', ' ')}
      </span>
    );
  };

  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading call history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Phone className="w-8 h-8 text-primary" />
                Call History
              </h1>
              <p className="text-gray-600 mt-1">View and manage all your call sessions</p>
            </div>
            <button
              onClick={() => navigate('/advisor/dashboard')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by client or product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Outcomes</option>
              <option value="draft_saved">Draft Saved</option>
              <option value="directly_confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="mt-4 text-sm text-primary flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide' : 'Show'} Date Filters
          </button>

          {showFilters && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          )}
        </motion.div>

        <div className="mb-4 text-sm text-gray-600">
          Showing {paginatedSessions.length} of {filteredSessions.length} calls
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th onClick={() => handleSort('date')} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100">
                    Date & Time {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('client')} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100">
                    Client {sortBy === 'client' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th onClick={() => handleSort('duration')} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100">
                    Duration {sortBy === 'duration' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Outcome</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedSessions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No calls found</p>
                    </td>
                  </tr>
                ) : (
                  paginatedSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">
                        {new Date(session.initiated_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium">{session.client_name}</span>
                      </td>
                      <td className="px-6 py-4 text-sm">{session.product_name}</td>
                      <td className="px-6 py-4 text-sm">{formatDuration(session.duration_seconds)}</td>
                      <td className="px-6 py-4">{getStatusBadge(session.status)}</td>
                      <td className="px-6 py-4">{getOutcomeBadge(session.final_action)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewDetails(session)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-primary hover:bg-primary/5 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>

        {showDetailModal && selectedCall && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold">Call Details</h2>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold mb-3">Call Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-600">Client:</span> <span className="ml-2 font-medium">{selectedCall.client_name}</span></div>
                    <div><span className="text-gray-600">Product:</span> <span className="ml-2 font-medium">{selectedCall.product_name}</span></div>
                    <div><span className="text-gray-600">Initiated:</span> <span className="ml-2 font-medium">{new Date(selectedCall.initiated_at).toLocaleString()}</span></div>
                    <div><span className="text-gray-600">Duration:</span> <span className="ml-2 font-medium">{formatDuration(selectedCall.duration_seconds)}</span></div>
                    <div><span className="text-gray-600">Status:</span> <span className="ml-2">{getStatusBadge(selectedCall.status)}</span></div>
                    <div><span className="text-gray-600">Outcome:</span> <span className="ml-2">{getOutcomeBadge(selectedCall.final_action)}</span></div>
                  </div>
                </div>

                {draftFields && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Extracted Data</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {Object.entries(draftFields).map(([key, value]) => {
                        if (['id', 'call_session_id', 'product_id', 'product_type', 'created_at', 'updated_at', 'confirmed_at', 'extraction_status', 'field_extraction_metadata'].includes(key)) {
                          return null;
                        }
                        return (
                          <div key={key}>
                            <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                            <span className="ml-2 font-medium">{value ? String(value) : '-'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Transcript</h3>
                    <button onClick={copyTranscript} className="text-sm text-primary flex items-center gap-2">
                      <Copy className="w-4 h-4" /> Copy
                    </button>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto bg-gray-50 rounded-lg p-4">
                    {transcripts.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No transcript</p>
                    ) : (
                      transcripts.map((t) => (
                        <div key={t.id} className={`p-3 rounded-lg ${t.speaker === 'ai_bot' ? 'bg-primary/10 ml-8' : 'bg-white mr-8'}`}>
                          <div className="flex justify-between mb-1 text-xs">
                            <span className="font-medium">{t.speaker === 'ai_bot' ? 'AI' : 'Client'}</span>
                            <span className="text-gray-500">{new Date(t.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-sm">{t.message_text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t flex justify-end">
                <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvisorCallHistory;
