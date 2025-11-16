import { motion, AnimatePresence } from 'framer-motion';
import { PhoneCall, X, User as UserIcon } from 'lucide-react';
import { useCallNotifications } from '../../context/CallNotificationContext';
import { useEffect, useState } from 'react';
import { getUserById } from '../../services/userService';
import { getProductById } from '../../services/productService';
import { supabase } from '../../config/supabase';

/**
 * Call Notification Dropdown
 * 
 * Displays incoming call notifications with Accept/Reject actions.
 * Appears below the call notification button in the header.
 */

interface CallNotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EnrichedCall {
  callSessionId: string;
  advisorName: string;
  productName: string;
  productType: string;
  initiatedAt: string;
}

export const CallNotificationDropdown = ({ isOpen, onClose }: CallNotificationDropdownProps) => {
  const { incomingCalls, acceptCall, rejectCall } = useCallNotifications();
  const [enrichedCalls, setEnrichedCalls] = useState<EnrichedCall[]>([]);

  // Enrich call data with advisor and product names
  useEffect(() => {
    const enrichCalls = async () => {
      const enriched = await Promise.all(
        incomingCalls.map(async (call) => {
          // Fetch advisor name
          const advisor = await getUserById(call.advisor_id);
          
          // Fetch product name
          let productName = 'Product';
          if (call.product_type === 'superannuation') {
            const { data } = await supabase
              .from('superannuation_accounts')
              .select('fund_name')
              .eq('id', call.product_id)
              .maybeSingle();
            productName = data?.fund_name || 'Superannuation Account';
          } else {
            const product = await getProductById(call.product_id);
            productName = product?.product_name || 'Financial Product';
          }

          return {
            callSessionId: call.id,
            advisorName: advisor?.full_name || 'Your Advisor',
            productName,
            productType: call.product_type,
            initiatedAt: call.initiated_at,
          };
        })
      );
      setEnrichedCalls(enriched);
    };

    if (incomingCalls.length > 0) {
      enrichCalls();
    } else {
      setEnrichedCalls([]);
    }
  }, [incomingCalls]);

  const handleAccept = async (callSessionId: string) => {
    await acceptCall(callSessionId);
    onClose();
  };

  const handleReject = async (callSessionId: string) => {
    await rejectCall(callSessionId);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.call-notification-dropdown') && !target.closest('.call-notification-button')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="call-notification-dropdown absolute top-full right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Incoming Calls</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/50 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Call List */}
          <div className="max-h-96 overflow-y-auto">
            {enrichedCalls.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <PhoneCall className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-500">No incoming calls</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {enrichedCalls.map((call) => (
                  <motion.div
                    key={call.callSessionId}
                    className="p-4 hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    {/* Call Info */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {call.advisorName}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {call.productName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Beneficiary Data Collection
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAccept(call.callSessionId)}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <PhoneCall className="w-4 h-4" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleReject(call.callSessionId)}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
