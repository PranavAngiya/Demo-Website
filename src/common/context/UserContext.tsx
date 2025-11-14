import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import mockUserData from '../data/mockUser.json';
import mockTransactionsData from '../data/mockTransactions.json';
import { getCurrentUser } from '../services/authService';
import { getUserById, type User as DBUser } from '../services/userService';

interface UserContextType {
  user: typeof mockUserData | DBUser;
  dbUser: DBUser | null;
  transactions: typeof mockTransactionsData;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const sessionUser = getCurrentUser();
        if (sessionUser) {
          const userData = await getUserById(sessionUser.id);
          if (userData) {
            setDbUser(userData);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ 
      user: dbUser || mockUserData, 
      dbUser,
      transactions: mockTransactionsData,
      isLoading
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
