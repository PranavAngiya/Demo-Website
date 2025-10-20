import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { UserProvider } from './context/UserContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import Spinner from './components/ui/Spinner';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Tutor = lazy(() => import('./pages/Tutor'));
const LessonDetail = lazy(() => import('./pages/LessonDetail'));
const Progress = lazy(() => import('./pages/Progress'));
const Components = lazy(() => import('./pages/Components'));
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
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/tutor" element={<Tutor />} />
                  <Route path="/tutor/lesson/:lessonId" element={<LessonDetail />} />
                  <Route path="/progress" element={<Progress />} />
                  <Route path="/components" element={<Components />} />
                  {/* 404 catch-all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Layout>
          </UserProvider>
        </ToastProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
