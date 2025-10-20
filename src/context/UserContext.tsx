import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import mockUserData from '../data/mockUser.json';
import mockTransactionsData from '../data/mockTransactions.json';

interface UserContextType {
  user: typeof mockUserData;
  transactions: typeof mockTransactionsData;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  return (
    <UserContext.Provider value={{ user: mockUserData, transactions: mockTransactionsData }}>
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
