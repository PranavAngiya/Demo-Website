# Guide: Adding a New Page

**Quick reference for adding pages to the modular architecture**

## 1. Create Page Directory Structure

```bash
src/pages/[page-name]/
├── components/
│   └── ui/              # Copy UI components you need from another page
├── data/                # Optional: page-specific JSON data
├── hooks/               # Optional: page-specific custom hooks
├── styles/              # Required: page styles
│   └── [page-name].css
└── index.tsx            # Required: main page component
```

## 2. Create Main Page Component (`index.tsx`)

```tsx
import { motion } from 'framer-motion';
import { IconName } from 'lucide-react';
import './styles/[page-name].css';

// Import UI components from local components/ui/
import Button from './components/ui/Button';
import Card from './components/ui/Card';

// Import contexts from common (if needed)
import { useToast } from '../../common/context/ToastContext';
import { useUser } from '../../common/context/UserContext';

// Import data from local data/ (if needed)
import pageData from './data/pageData.json';

const PageName = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Your page content */}
      </motion.div>
    </div>
  );
};

export default PageName;
```

## 3. Copy UI Components

**Copy from any existing page** (e.g., `src/pages/dashboard/components/ui/`):

```bash
# Common UI components to copy:
- Button.tsx       # Buttons with variants
- Card.tsx         # Card containers
- Input.tsx        # Form inputs
- Badge.tsx        # Status badges
- Spinner.tsx      # Loading spinners
- ProgressBar.tsx  # Progress indicators
- Modal.tsx        # Modal dialogs
- Toast.tsx        # Toast notifications (used by ToastContext)
```

**Copy entire folder**:
```bash
Copy-Item "src/pages/dashboard/components/ui/*" "src/pages/[page-name]/components/ui/"
```

## 4. Create Page Styles

**Copy base styles** from any existing page:
```bash
Copy-Item "src/pages/homepage/styles/homepage.css" "src/pages/[page-name]/styles/[page-name].css"
```

This includes:
- Tailwind directives (`@tailwind base/components/utilities`)
- Global design tokens (CSS variables)
- Accessibility utilities
- Animation classes
- Theme utilities

**No additional imports needed** - the base CSS has everything.

## 5. Add Page Data (Optional)

If your page needs mock/fallback data:
```bash
src/pages/[page-name]/data/pageData.json
```

Import in your page:
```tsx
import pageData from './data/pageData.json';
```

## 6. Add Custom Hooks (Optional)

If your page needs custom hooks:
```bash
src/pages/[page-name]/hooks/useCustomHook.ts
```

Import in your page:
```tsx
import { useCustomHook } from './hooks/useCustomHook';
```

## 7. Update App.tsx Routing

**Add lazy import** (line ~14-24):
```tsx
const PageName = lazy(() => import('./pages/[page-name]'));
```

**Add route** in appropriate section:
```tsx
{/* Client Portal Routes */}
<Route path="/client" element={<ClientLayout />}>
  <Route path="new-page" element={<PageName />} />
</Route>

{/* OR Advisor Portal Routes */}
<Route path="/advisor" element={<AdvisorLayout />}>
  <Route path="new-page" element={<PageName />} />
</Route>

{/* OR Standalone Route */}
<Route path="/new-page" element={<PageName />} />
```

## 8. Common Resources (Shared)

**Available in `src/common/`** - import as needed:

### Contexts
```tsx
import { useUser } from '../../common/context/UserContext';
import { useToast } from '../../common/context/ToastContext';
import { useChatbot } from '../../common/context/ChatbotContext';
```

### Layouts
```tsx
import ClientLayout from '../../common/components/layout/ClientLayout';
import AdvisorLayout from '../../common/components/layout/AdvisorLayout';
```

### Utils
```tsx
import { initializeA11y } from '../../common/utils/a11y';
import { findBestFAQMatch } from '../../common/utils/faqMatcher';
```

### Data (Shared)
```tsx
import mockUser from '../../common/data/mockUser.json';
import faqData from '../../common/data/faqData.json';
```

## 9. Checklist

Before completing a new page:

- [ ] Directory structure created (`components/ui/`, `styles/`, `data/`, `hooks/`)
- [ ] Main `index.tsx` created with default export
- [ ] UI components copied to local `components/ui/`
- [ ] Page CSS created and imported in `index.tsx`
- [ ] Data files added (if needed)
- [ ] Custom hooks added (if needed)
- [ ] Lazy import added to `App.tsx`
- [ ] Route added to `App.tsx`
- [ ] Page renders without errors
- [ ] All imports resolve correctly

## 10. Common Patterns

### Using Layouts
```tsx
// Client pages wrap with ClientLayout (has Header + Footer)
// Already handled in App.tsx routing
<Route path="/client" element={<ClientLayout />}>
  <Route path="page" element={<YourPage />} />
</Route>
```

### Using Toast Notifications
```tsx
import { useToast } from '../../common/context/ToastContext';

const { showToast } = useToast();
showToast('Success message', 'success');
```

### Using User Context
```tsx
import { useUser } from '../../common/context/UserContext';

const { user, transactions } = useUser();
```

### Animation Pattern
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {/* content */}
</motion.div>
```

## Quick Reference: File Paths

```
Your Page:     src/pages/[page-name]/index.tsx
Local UI:      ./components/ui/Button
Local Data:    ./data/pageData.json
Local Hooks:   ./hooks/useCustomHook
Local Styles:  ./styles/[page-name].css

Common Context:   ../../common/context/UserContext
Common Utils:     ../../common/utils/a11y
Common Data:      ../../common/data/mockUser.json
```

## Example: Complete New Page

```tsx
// src/pages/profile/index.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone } from 'lucide-react';
import './styles/profile.css';

import Button from './components/ui/Button';
import Card from './components/ui/Card';
import Input from './components/ui/Input';
import { useUser } from '../../common/context/UserContext';
import { useToast } from '../../common/context/ToastContext';

const Profile = () => {
  const { user } = useUser();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ name: user.name, email: user.email });

  const handleSave = () => {
    showToast('Profile updated successfully!', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <motion.div
        className="container mx-auto px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
          <Input label="Name" value={formData.name} />
          <Input label="Email" value={formData.email} type="email" />
          <Button onClick={handleSave}>Save Changes</Button>
        </Card>
      </motion.div>
    </div>
  );
};

export default Profile;
```

---

**That's it!** Your page is now part of the modular architecture.
