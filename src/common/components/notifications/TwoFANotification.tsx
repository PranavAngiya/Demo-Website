import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Check, X } from 'lucide-react';
import { useTwoFANotifications } from '../../context/TwoFANotificationContext';

/**
 * Two-Factor Authentication Notification Component
 * 
 * Displays a notification banner when the AI bot requests permission
 * to collect beneficiary information. Does not block the entire UI.
 */

export const TwoFANotification = () => {
  const { pendingTwoFARequests, confirmTwoFA, rejectTwoFA } = useTwoFANotifications();

  // Get the first pending request (only show one at a time)
  const currentRequest = pendingTwoFARequests[0];

  const handleConfirm = async () => {
    if (currentRequest) {
      await confirmTwoFA(currentRequest.callSessionId);
    }
  };

  const handleReject = async () => {
    if (currentRequest) {
      await rejectTwoFA(currentRequest.callSessionId);
    }
  };

  return (
    <AnimatePresence>
      {currentRequest && (
        <motion.div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-xl shadow-2xl overflow-hidden">
            {/* Warning Stripe */}
            <div className="h-2 bg-gradient-to-r from-orange-400 to-yellow-400" />

            {/* Content */}
            <div className="p-5">
              {/* Icon and Title */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white flex-shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    Consent Required
                  </h3>
                  <p className="text-sm text-gray-700">
                    {currentRequest.message}
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-white/60 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-600">
                  <strong>Note:</strong> You are speaking with an automated AI assistant. 
                  Your responses will be recorded to collect beneficiary information for your product.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  <span>Accept & Continue</span>
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  <span>Reject</span>
                </button>
              </div>

              {/* Countdown or Timer (Optional Enhancement) */}
              {pendingTwoFARequests.length > 1 && (
                <p className="text-xs text-center text-gray-500 mt-3">
                  {pendingTwoFARequests.length - 1} more notification{pendingTwoFARequests.length - 1 > 1 ? 's' : ''} pending
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
