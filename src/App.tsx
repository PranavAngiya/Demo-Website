import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { UserProvider } from './context/UserContext';
import { ToastProvider } from './context/ToastContext';
import { ChatbotProvider } from './context/ChatbotContext';
import ClientLayout from './components/layout/ClientLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
import Spinner from './components/ui/Spinner';
import FloatingChatButton from './components/chatbot/FloatingChatButton';
import ChatPanel from './components/chatbot/ChatPanel';

// Lazy load pages for better performance
const Homepage = lazy(() => import('./pages/Homepage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const FAQ = lazy(() => import('./pages/FAQ'));
const TrainingHub = lazy(() => import('./pages/TrainingHub'));
const CustomerCare = lazy(() => import('./pages/CustomerCare'));
const Tutor = lazy(() => import('./pages/Tutor'));
const LessonDetail = lazy(() => import('./pages/LessonDetail'));
const Progress = lazy(() => import('./pages/Progress'));
const Components = lazy(() => import('./pages/Components'));
const AdvisorRedirect = lazy(() => import('./pages/AdvisorRedirect'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Spinner size="lg" />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ToastProvider>
          <UserProvider>
            <ChatbotProvider>
              <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Homepage - Portal selection */}
                <Route path="/" element={<Homepage />} />
                
                {/* Client Portal Routes */}
                <Route path="/client" element={<ClientLayout />}>
                  <Route index element={<Navigate to="/client/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="faq" element={<FAQ />} />
                  <Route path="training-hub" element={<TrainingHub />} />
                  <Route path="customer-care" element={<CustomerCare />} />
                  <Route path="tutor" element={<Tutor />} />
                  <Route path="tutor/lesson/:lessonId" element={<LessonDetail />} />
                  <Route path="progress" element={<Progress />} />
                  <Route path="components" element={<Components />} />
                </Route>
                
                {/* Advisor Portal Redirect */}
                <Route path="/advisor" element={<AdvisorRedirect />} />
                
                {/* 404 catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            
            {/* Chatbot */}
            <FloatingChatButton />
            <ChatPanel />
          </ChatbotProvider>
          </UserProvider>
        </ToastProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
