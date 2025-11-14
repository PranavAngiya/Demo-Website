import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, Sparkles } from 'lucide-react';
import Button from './components/ui/Button';
import Card from './components/ui/Card';
import Input from './components/ui/Input';
import Badge from './components/ui/Badge';
import Modal from './components/ui/Modal';
import Spinner from './components/ui/Spinner';
import Skeleton from './components/ui/Skeleton';
import ProgressBar from './components/ui/ProgressBar';
import { useToast } from '../../common/context/ToastContext';
import './styles/components.css';

const Components = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast('Action completed successfully!', 'success');
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-4">
          Design System Showcase
        </h1>
        <p className="text-xl text-gray-600">
          Beautiful, reusable components with smooth animations
        </p>
      </motion.div>

      {/* Buttons Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Buttons</h2>
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="danger">Danger Button</Button>
              <Button variant="success">Success Button</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="sm" variant="primary">Small</Button>
              <Button size="md" variant="primary">Medium</Button>
              <Button size="lg" variant="primary">Large</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" icon={<Heart className="w-5 h-5" />}>
                With Icon
              </Button>
              <Button variant="primary" isLoading={isLoading} onClick={handleLoadingDemo}>
                {isLoading ? 'Loading...' : 'Click to Load'}
              </Button>
              <Button variant="primary" disabled>
                Disabled
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Cards Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="solid" className="p-6">
            <h3 className="text-lg font-semibold mb-2">Solid Card</h3>
            <p className="text-gray-600">Standard card with shadow and hover effect.</p>
          </Card>
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-semibold mb-2">Glass Card</h3>
            <p className="text-gray-600">Glassmorphic card with backdrop blur.</p>
          </Card>
          <Card variant="gradient" className="p-6">
            <h3 className="text-lg font-semibold mb-2">Gradient Card</h3>
            <p className="text-gray-600">Card with subtle gradient background.</p>
          </Card>
        </div>
      </section>

      {/* Inputs Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Input Fields</h2>
        <Card className="p-6">
          <div className="space-y-4 max-w-md">
            <Input
              label="Email Address"
              type="email"
              placeholder="your@email.com"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onClear={() => setInputValue('')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter password"
            />
            <Input
              label="With Icon"
              placeholder="Search..."
              icon={<Sparkles className="w-5 h-5" />}
            />
            <Input
              label="Error State"
              placeholder="Invalid input"
              error="This field is required"
            />
          </div>
        </Card>
      </section>

      {/* Badges Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Badges</h2>
        <Card className="p-6">
          <div className="flex flex-wrap gap-3">
            <Badge variant="default">Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="primary" pulse>Pulsing</Badge>
          </div>
        </Card>
      </section>

      {/* Modal Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Modal</h2>
        <Card className="p-6">
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            Open Modal
          </Button>
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Beautiful Modal"
            size="md"
          >
            <div className="space-y-4">
              <p className="text-gray-600">
                This is a beautiful modal with smooth animations, backdrop blur, and keyboard support.
                Press ESC or click outside to close.
              </p>
              <div className="flex gap-3">
                <Button variant="primary" icon={<Star className="w-5 h-5" />}>
                  Confirm
                </Button>
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        </Card>
      </section>

      {/* Toast Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Toast Notifications</h2>
        <Card className="p-6">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="success"
              onClick={() => showToast('Success! Your changes have been saved.', 'success')}
            >
              Success Toast
            </Button>
            <Button
              variant="danger"
              onClick={() => showToast('Error! Something went wrong.', 'error')}
            >
              Error Toast
            </Button>
            <Button
              variant="primary"
              onClick={() => showToast('Info: This is an informational message.', 'info')}
            >
              Info Toast
            </Button>
            <Button
              variant="secondary"
              onClick={() => showToast('Warning: Please review your input.', 'warning')}
            >
              Warning Toast
            </Button>
          </div>
        </Card>
      </section>

      {/* Loading States Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Loading States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Spinners</h3>
            <div className="flex items-center gap-6">
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
              <Spinner size="md" color="secondary" />
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Skeleton Screens</h3>
            <div className="space-y-3">
              <Skeleton variant="text" />
              <Skeleton variant="text" width="80%" />
              <div className="flex gap-3">
                <Skeleton variant="circular" width={40} />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="60%" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Progress Bars Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Progress Bars</h2>
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Primary</p>
              <ProgressBar value={75} color="primary" showLabel />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Success</p>
              <ProgressBar value={90} color="success" size="md" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Warning (Striped)</p>
              <ProgressBar value={50} color="warning" size="lg" striped />
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Components;
