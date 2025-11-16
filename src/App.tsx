import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { UserProvider } from './common/context/UserContext';
import { ToastProvider } from './common/context/ToastContext';
import { ChatbotProvider } from './common/context/ChatbotContext';
import { CallNotificationProvider } from './common/context/CallNotificationContext';
import { TwoFANotificationProvider } from './common/context/TwoFANotificationContext';
import ClientLayout from './common/components/layout/ClientLayout';
import AdvisorLayout from './common/components/layout/AdvisorLayout';
import ErrorBoundary from './common/components/common/ErrorBoundary';
import Spinner from './pages/dashboard/components/ui/Spinner';
import FloatingChatButton from './common/components/chatbot/FloatingChatButton';
import ChatPanel from './common/components/chatbot/ChatPanel';
import { TwoFANotification } from './common/components/notifications/TwoFANotification';

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/login'));
const Homepage = lazy(() => import('./pages/homepage'));
const Dashboard = lazy(() => import('./pages/dashboard'));
const Profile = lazy(() => import('./pages/profile'));
const ProductDetails = lazy(() => import('./pages/product-details'));
const AdvisorDashboard = lazy(() => import('./pages/advisor-dashboard'));
const AdvisorClients = lazy(() => import('./pages/advisor-clients'));
const AdvisorClientDetail = lazy(() => import('./pages/advisor-client-detail'));
const AdvisorCallMonitor = lazy(() => import('./pages/advisor-call-monitor'));
const AdvisorCallHistory = lazy(() => import('./pages/advisor-call-history'));
const FAQ = lazy(() => import('./pages/faq'));
const TrainingHub = lazy(() => import('./pages/training-hub'));
const CustomerCare = lazy(() => import('./pages/customer-care'));
const Tutor = lazy(() => import('./pages/tutor'));
const LessonDetail = lazy(() => import('./pages/lesson-detail'));
const Progress = lazy(() => import('./pages/progress'));
const Components = lazy(() => import('./pages/components-showcase'));
const CallInterface = lazy(() => import('./pages/call-interface'));
const NotFound = lazy(() => import('./pages/not-found'));

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
            <CallNotificationProvider>
              <TwoFANotificationProvider>
                <ChatbotProvider>
                  {/* Global 2FA Notification - appears on all pages for clients */}
                  <TwoFANotification />
                  
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Root - Redirect to Login */}
                      <Route path="/" element={<Navigate to="/login" replace />} />
                      
                      {/* Login Route */}
                      <Route path="/login" element={<Login />} />
                      
                      {/* Homepage - Portal selection (for reference) */}
                      <Route path="/portal" element={<Homepage />} />
                      
                      {/* Client Portal Routes */}
                      <Route path="/client" element={<ClientLayout />}>
                        <Route index element={<Navigate to="/client/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="products/:productId" element={<ProductDetails />} />
                        <Route path="faq" element={<FAQ />} />
                        <Route path="learning" element={<Tutor />} />
                        <Route path="learning/lesson/:lessonId" element={<LessonDetail />} />
                        <Route path="progress" element={<Progress />} />
                        <Route path="components" element={<Components />} />
                        <Route path="call/:callSessionId" element={<CallInterface />} />
                      </Route>
                      
                      {/* Advisor Portal Routes */}
                      <Route path="/advisor" element={<AdvisorLayout />}>
                        <Route index element={<Navigate to="/advisor/dashboard" replace />} />
                        <Route path="dashboard" element={<AdvisorDashboard />} />
                        <Route path="clients" element={<AdvisorClients />} />
                        <Route path="clients/:clientId" element={<AdvisorClientDetail />} />
                        <Route path="call/:callSessionId" element={<AdvisorCallMonitor />} />
                        <Route path="call-history" element={<AdvisorCallHistory />} />
                        <Route path="training-hub" element={<TrainingHub />} />
                        <Route path="customer-care" element={<CustomerCare />} />
                      </Route>
                      
                      {/* 404 catch-all route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                  
                  <FloatingChatButton />
                  <ChatPanel />
                </ChatbotProvider>
              </TwoFANotificationProvider>
            </CallNotificationProvider>
          </UserProvider>
        </ToastProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
