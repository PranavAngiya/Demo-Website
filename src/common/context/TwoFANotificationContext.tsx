import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../config/supabase';
import { getCurrentUser } from '../services/authService';
import { updateTwoFAStatus } from '../services/callSessionService';

/**
 * Two-Factor Authentication (2FA) Notification Context
 * 
 * Manages 2FA consent requests during AI call sessions.
 * Displays notification to client requesting permission to collect beneficiary data.
 */

interface TwoFARequest {
  callSessionId: string;
  message: string;
  requestedAt: string;
  productName?: string;
}

interface TwoFANotificationContextType {
  pendingTwoFARequests: TwoFARequest[];
  hasPendingRequests: boolean;
  confirmTwoFA: (callSessionId: string) => Promise<void>;
  rejectTwoFA: (callSessionId: string) => Promise<void>;
  addTwoFARequest: (request: TwoFARequest) => void;
  removeTwoFARequest: (callSessionId: string) => void;
}

const TwoFANotificationContext = createContext<TwoFANotificationContextType | undefined>(undefined);

interface TwoFANotificationProviderProps {
  children: ReactNode;
}

export const TwoFANotificationProvider = ({ children }: TwoFANotificationProviderProps) => {
  const [pendingTwoFARequests, setPendingTwoFARequests] = useState<TwoFARequest[]>([]);
  const currentUser = getCurrentUser();

  useEffect(() => {
    // Only set up real-time subscription for clients
    if (!currentUser || currentUser.role !== 'client') {
      return;
    }

    // Subscribe to call_sessions updates for 2FA status changes
    const channel = supabase
      .channel('twofa-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'call_sessions',
          filter: `client_id=eq.${currentUser.id}`,
        },
        (payload) => {
          const updatedCall = payload.new as any;
          
          // Check if 2FA status changed to 'pending'
          if (updatedCall.twofa_status === 'pending') {
            const request: TwoFARequest = {
              callSessionId: updatedCall.id,
              message: 'Confirm you are speaking with an AI bot and consent to provide beneficiary information',
              requestedAt: updatedCall.twofa_requested_at || new Date().toISOString(),
              productName: updatedCall.product_id, // Can be enriched with actual product name if needed
            };
            
            setPendingTwoFARequests((prev) => {
              // Check if request already exists
              if (prev.some((req) => req.callSessionId === request.callSessionId)) {
                return prev;
              }
              return [...prev, request];
            });
          }
          
          // Remove request if status changed to confirmed or rejected
          if (updatedCall.twofa_status === 'confirmed' || updatedCall.twofa_status === 'rejected') {
            setPendingTwoFARequests((prev) =>
              prev.filter((req) => req.callSessionId !== updatedCall.id)
            );
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  /**
   * Confirm 2FA consent
   */
  const confirmTwoFA = async (callSessionId: string) => {
    try {
      // Update 2FA status to 'confirmed'
      const result = await updateTwoFAStatus(callSessionId, 'confirmed');
      
      if (result.success) {
        // Remove from pending requests
        setPendingTwoFARequests((prev) =>
          prev.filter((req) => req.callSessionId !== callSessionId)
        );
        
        // TODO: Backend Integration - Send confirmation message to backend via WebSocket
        // This will signal the AI to resume audio collection
        console.log('2FA confirmed for call session:', callSessionId);
      } else {
        console.error('Failed to confirm 2FA:', result.error);
      }
    } catch (error) {
      console.error('Error confirming 2FA:', error);
    }
  };

  /**
   * Reject 2FA consent
   */
  const rejectTwoFA = async (callSessionId: string) => {
    try {
      // Update 2FA status to 'rejected'
      const result = await updateTwoFAStatus(callSessionId, 'rejected');
      
      if (result.success) {
        // Remove from pending requests
        setPendingTwoFARequests((prev) =>
          prev.filter((req) => req.callSessionId !== callSessionId)
        );
        
        // TODO: Backend Integration - Send rejection message to backend via WebSocket
        // This will signal the AI to end the call gracefully
        console.log('2FA rejected for call session:', callSessionId);
      } else {
        console.error('Failed to reject 2FA:', result.error);
      }
    } catch (error) {
      console.error('Error rejecting 2FA:', error);
    }
  };

  /**
   * Manually add a 2FA request (for testing or direct calls)
   */
  const addTwoFARequest = (request: TwoFARequest) => {
    setPendingTwoFARequests((prev) => {
      // Check if request already exists
      if (prev.some((req) => req.callSessionId === request.callSessionId)) {
        return prev;
      }
      return [...prev, request];
    });
  };

  /**
   * Manually remove a 2FA request
   */
  const removeTwoFARequest = (callSessionId: string) => {
    setPendingTwoFARequests((prev) =>
      prev.filter((req) => req.callSessionId !== callSessionId)
    );
  };

  return (
    <TwoFANotificationContext.Provider
      value={{
        pendingTwoFARequests,
        hasPendingRequests: pendingTwoFARequests.length > 0,
        confirmTwoFA,
        rejectTwoFA,
        addTwoFARequest,
        removeTwoFARequest,
      }}
    >
      {children}
    </TwoFANotificationContext.Provider>
  );
};

/**
 * Hook to use 2FA notification context
 */
export const useTwoFANotifications = () => {
  const context = useContext(TwoFANotificationContext);
  if (context === undefined) {
    throw new Error('useTwoFANotifications must be used within a TwoFANotificationProvider');
  }
  return context;
};
