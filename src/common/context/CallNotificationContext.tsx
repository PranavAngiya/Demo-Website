import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../config/supabase';
import { getCurrentUser } from '../services/authService';
import type { CallSession } from '../services/callSessionService';
import { updateCallSessionStatus } from '../services/callSessionService';

/**
 * Call Notification Context
 * 
 * Manages incoming call notifications for clients.
 * Listens to real-time updates from Supabase for new call sessions.
 */

interface CallNotificationContextType {
  incomingCalls: CallSession[];
  acceptCall: (callSessionId: string) => Promise<void>;
  rejectCall: (callSessionId: string) => Promise<void>;
  removeIncomingCall: (callSessionId: string) => void;
}

const CallNotificationContext = createContext<CallNotificationContextType | undefined>(undefined);

interface CallNotificationProviderProps {
  children: ReactNode;
}

export const CallNotificationProvider = ({ children }: CallNotificationProviderProps) => {
  const [incomingCalls, setIncomingCalls] = useState<CallSession[]>([]);
  const currentUser = getCurrentUser();

  useEffect(() => {
    // Only set up real-time subscription for clients
    if (!currentUser || currentUser.role !== 'client') {
      return;
    }

    // Fetch existing incoming calls
    const fetchIncomingCalls = async () => {
      try {
        const { data, error } = await supabase
          .from('call_sessions')
          .select('*')
          .eq('client_id', currentUser.id)
          .in('status', ['initiated', 'ringing'])
          .order('initiated_at', { ascending: false });

        if (error) {
          console.error('Error fetching incoming calls:', error);
          return;
        }

        setIncomingCalls((data || []) as CallSession[]);
      } catch (error) {
        console.error('Error in fetchIncomingCalls:', error);
      }
    };

    fetchIncomingCalls();

    // Subscribe to real-time updates for new calls
    const channel = supabase
      .channel('call-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_sessions',
          filter: `client_id=eq.${currentUser.id}`,
        },
        (payload) => {
          const newCall = payload.new as CallSession;
          if (newCall.status === 'ringing' || newCall.status === 'initiated') {
            setIncomingCalls((prev) => [newCall, ...prev]);
            
            // Optional: Play notification sound
            playNotificationSound();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'call_sessions',
          filter: `client_id=eq.${currentUser.id}`,
        },
        (payload) => {
          const updatedCall = payload.new as CallSession;
          
          // Remove from incoming calls if status changed from 'ringing'
          if (updatedCall.status !== 'ringing') {
            setIncomingCalls((prev) =>
              prev.filter((call) => call.id !== updatedCall.id)
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
   * Accept an incoming call
   */
  const acceptCall = async (callSessionId: string) => {
    try {
      // Update call status to 'in_progress'
      const result = await updateCallSessionStatus(callSessionId, 'in_progress');
      
      if (result.success) {
        // Remove from incoming calls list
        setIncomingCalls((prev) => prev.filter((call) => call.id !== callSessionId));
        
        // Navigate to call interface
        window.location.href = `/client/call/${callSessionId}`;
      } else {
        console.error('Failed to accept call:', result.error);
      }
    } catch (error) {
      console.error('Error accepting call:', error);
    }
  };

  /**
   * Reject an incoming call
   */
  const rejectCall = async (callSessionId: string) => {
    try {
      // Update call status to 'cancelled'
      const result = await updateCallSessionStatus(callSessionId, 'cancelled');
      
      if (result.success) {
        // Remove from incoming calls list
        setIncomingCalls((prev) => prev.filter((call) => call.id !== callSessionId));
      } else {
        console.error('Failed to reject call:', result.error);
      }
    } catch (error) {
      console.error('Error rejecting call:', error);
    }
  };

  /**
   * Remove a call from the incoming calls list (without updating database)
   */
  const removeIncomingCall = (callSessionId: string) => {
    setIncomingCalls((prev) => prev.filter((call) => call.id !== callSessionId));
  };

  /**
   * Play notification sound (optional)
   */
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Ignore errors if audio can't play (e.g., no user interaction yet)
      });
    } catch (error) {
      // Audio not available or failed to play
    }
  };

  return (
    <CallNotificationContext.Provider
      value={{
        incomingCalls,
        acceptCall,
        rejectCall,
        removeIncomingCall,
      }}
    >
      {children}
    </CallNotificationContext.Provider>
  );
};

/**
 * Hook to use call notification context
 */
export const useCallNotifications = () => {
  const context = useContext(CallNotificationContext);
  if (context === undefined) {
    throw new Error('useCallNotifications must be used within a CallNotificationProvider');
  }
  return context;
};
