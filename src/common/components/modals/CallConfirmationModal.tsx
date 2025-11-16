import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, AlertTriangle } from 'lucide-react';

/**
 * Call Confirmation Modal
 * 
 * Confirmation dialog before initiating AI call with client.
 * Shows client name, product info, and warning about automated call.
 */

interface CallConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  clientName: string;
  productName: string;
  productType: string;
  isLoading?: boolean;
}

const CallConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  clientName,
  productName,
  productType,
  isLoading = false,
}: CallConfirmationModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  <X className="w-6 h-6" />
                </button>
                
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Initiate AI Call</h2>
                    <p className="text-white/90 text-sm">Automated beneficiary collection</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                {/* Warning Alert */}
                <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-orange-900 mb-1">
                        Important Notice
                      </h3>
                      <p className="text-sm text-orange-800">
                        An AI-powered voice assistant will call the client to collect beneficiary information.
                        The client must accept the call and provide consent before any data is collected.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Call Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Client</span>
                    <span className="font-semibold text-gray-900">{clientName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Product</span>
                    <span className="font-semibold text-gray-900">{productName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Product Type</span>
                    <span className="font-semibold text-gray-900 capitalize">
                      {productType.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Confirmation Message */}
                <div className="mb-6 text-center">
                  <p className="text-gray-700 text-lg">
                    Initiate AI call with <span className="font-bold text-gray-900">{clientName}</span> to collect beneficiary information?
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        Initiating...
                      </>
                    ) : (
                      <>
                        <Phone className="w-5 h-5" />
                        Initiate Call
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CallConfirmationModal;
