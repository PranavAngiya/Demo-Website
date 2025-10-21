# CFS Unified Portal - Integration PRD
**Version:** 1.0 | **Date:** October 21, 2025

## 📋 Executive Summary
Integrate three codebases into a unified CFS Portal:
- **Main Directory**: Dashboard, FAQ, Progress (restyled)
- **CFS_Demo**: Training Hub, Customer Care, design system
- **Chatbot**: React-based OpenAI assistant
- **Advisor Portal**: External redirect to Vercel

## 🎯 Objectives
1. Create Homepage for Client/Advisor selection
2. Apply CFS_Demo styling to all pages
3. Integrate Training Hub + Customer Care
4. Build React chatbot with FAQ-first logic

## 🏗️ Route Structure
```
/                    → Homepage (portal selection)
/client/dashboard    → Dashboard (restyled)
/client/faq          → FAQ (restyled)
/client/progress     → Progress (restyled)
/client/training-hub → Training Hub (from CFS_Demo)
/client/customer-care → Customer Care (from CFS_Demo)
/advisor             → Redirect to https://advisor-insight-studio.vercel.app/
```

## 🎨 Design System (CFS_Demo)
**Colors:**
- Primary: `#0c4a6e` (blue)
- Accent: `#2d9cdb` (light blue)
- Soft: `#e0f2fe`

**Typography:**
- Font: Source Sans 3, IBM Plex Mono

**Patterns:**
- Glassmorphism with backdrop-blur
- Soft shadows: `0 18px 40px -24px rgba(15,23,42,0.35)`
- Large border-radius: 24px
- Gradient overlays

---

## 📝 CHAPTER 1: Environment Setup
**Priority:** Critical | **Duration:** 1 iteration

### Tasks
- [ ] Install dependencies from CFS_Demo
- [ ] Update `tailwind.config.js` with CFS_Demo tokens
- [ ] Add Source Sans 3 + IBM Plex Mono fonts
- [ ] Create `.env.example` with `VITE_OPENAI_API_KEY`
- [ ] Create `src/styles/cfs-demo-theme.css`
- [ ] Test build: `npm run build`

### Acceptance Criteria
- All dependencies installed
- Fonts load correctly
- Build completes without errors

### Files
- **Modified:** `package.json`, `tailwind.config.js`
- **Created:** `.env.example`, `src/styles/cfs-demo-theme.css`

---

## 📝 CHAPTER 2: Homepage & Routing
**Priority:** Critical | **Duration:** 1 iteration

### Tasks
**Homepage:**
- [ ] Create `src/pages/Homepage.tsx`
- [ ] Hero section with CFS_Demo gradient
- [ ] Two portal cards: Client + Advisor
- [ ] Hover effects: lift, scale, glow
- [ ] Mobile responsive

**Routing:**
- [ ] Update `App.tsx` with route structure:
  ```tsx
  <Route path="/" element={<Homepage />} />
  <Route path="/client/*" element={<ClientLayout />}>
    <Route index element={<Navigate to="/client/dashboard" />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="faq" element={<FAQ />} />
    <Route path="progress" element={<Progress />} />
  </Route>
  <Route path="/advisor" element={<AdvisorRedirect />} />
  ```
- [ ] Create `ClientLayout.tsx` wrapper
- [ ] Add "Home" button to Header (Client portal only)

**Advisor Redirect:**
- [ ] Create `AdvisorRedirect.tsx`
- [ ] Loading message: "Redirecting to Advisor Portal..."
- [ ] `useEffect` redirect to Vercel URL

### Acceptance Criteria
- Homepage renders with CFS_Demo styling
- Client/Advisor navigation works
- Home button appears in Client portal
- Advisor redirect navigates correctly

### Files
- **Created:** `Homepage.tsx`, `AdvisorRedirect.tsx`, `ClientLayout.tsx`
- **Modified:** `App.tsx`, `Header.tsx`

---

## 📝 CHAPTER 3: CFS_Demo Styling Migration
**Priority:** High | **Duration:** 2 iterations

### Part 1: Component Library
- [ ] **Button.tsx**: Update colors to CFS_Demo blue, adjust border-radius, hover effects
- [ ] **Card.tsx**: Apply glassmorphism, soft shadows, gradient overlays
- [ ] **Badge.tsx**: Update color variants to CFS_Demo palette
- [ ] **Input.tsx**: Match CFS_Demo borders, focus states
- [ ] **Modal.tsx**: Apply backdrop blur, update card styling

### Part 2: Pages
**Dashboard:**
- [ ] Update hero gradient to CFS_Demo colors
- [ ] Apply glassmorphic cards
- [ ] Restyle product cards with soft shadows
- [ ] Update badge colors

**FAQ:**
- [ ] Glassmorphic search bar
- [ ] CFS_Demo category pills
- [ ] New card styles for accordions
- [ ] Update answer panel

**Progress:**
- [ ] CFS_Demo progress bars
- [ ] Restyle badges
- [ ] Update level indicators

**Layout:**
- [ ] **Header**: Glassmorphism, CFS_Demo nav styling
- [ ] **Footer**: Match CFS_Demo design

### Acceptance Criteria
- All components match CFS_Demo visual style
- No visual regressions
- All functionality preserved
- Mobile responsive

### Files Modified
- Components: `Button.tsx`, `Card.tsx`, `Badge.tsx`, `Input.tsx`, `Modal.tsx`
- Pages: `Dashboard.tsx`, `FAQ.tsx`, `Progress.tsx`
- Layout: `Header.tsx`, `Footer.tsx`

---

## 📝 CHAPTER 4: Training Hub Integration
**Priority:** High | **Duration:** 2 iterations

### Tasks
**Conversion:**
- [ ] Copy `CFS_Demo/TrainingHubExperience.jsx` → `src/pages/TrainingHub.tsx`
- [ ] Convert JSX → TSX with types
- [ ] Copy `shared/content.json` → `src/data/training-content.json`
- [ ] Create TypeScript interfaces for training data

**Integration:**
- [ ] Add route: `<Route path="training-hub" element={<TrainingHub />} />`
- [ ] Add "Training Hub" to navigation
- [ ] Create `useTrainingContent()` hook
- [ ] Remove old `Tutor.tsx` page

**Testing:**
- [ ] Verify module navigation
- [ ] Test quiz functionality
- [ ] Test flashcards
- [ ] Test cheat sheet view

### Acceptance Criteria
- Training Hub loads without errors
- TypeScript compiles
- All features functional
- Mobile responsive

### Files
- **Created:** `TrainingHub.tsx`, `training-content.json`, `useTrainingContent.ts`
- **Modified:** `App.tsx`, `Header.tsx`
- **Deleted:** `Tutor.tsx`

---

## 📝 CHAPTER 5: Customer Care Integration
**Priority:** High | **Duration:** 2 iterations

### Tasks
**Conversion:**
- [ ] Copy `CFS_Demo/CustomerCareExperience.jsx` → `src/pages/CustomerCare.tsx`
- [ ] Convert JSX → TSX
- [ ] Create TypeScript interfaces

**Integration:**
- [ ] Add route: `<Route path="customer-care" element={<CustomerCare />} />`
- [ ] Add "Customer Care" to navigation
- [ ] Create `useCustomerCareContent()` hook

**Testing:**
- [ ] Test support procedures
- [ ] Verify guided workflows
- [ ] Test handover note generation

### Acceptance Criteria
- Customer Care loads successfully
- TypeScript compiles
- All features functional
- Mobile responsive

### Files
- **Created:** `CustomerCare.tsx`, `useCustomerCareContent.ts`
- **Modified:** `App.tsx`, `Header.tsx`

---

## 📝 CHAPTER 6: Chatbot - Backend Logic
**Priority:** Medium | **Duration:** 2 iterations

### Tasks
**OpenAI Setup:**
- [ ] Install: `npm install openai`
- [ ] Create `src/utils/openai.ts`:
  ```tsx
  export async function sendChatMessage(message: string, context: UserContext) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a CFS financial advisor...' },
        { role: 'user', content: message }
      ],
      temperature: 0.6,
      max_tokens: 400
    });
    return response.choices[0].message.content;
  }
  ```

**FAQ Matching:**
- [ ] Create `src/utils/faqMatcher.ts`:
  - Fuzzy search FAQ.json
  - Calculate confidence score
  - Return match if score > 80%

**Context & Hooks:**
- [ ] Create `ChatbotContext.tsx`:
  ```tsx
  interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    source?: 'faq' | 'ai';
  }
  ```
- [ ] Create `useChatbot.ts` hook:
  - Send message flow:
    1. Search FAQ
    2. If match: return FAQ answer
    3. Else: query OpenAI
  - Manage messages state
  - Handle errors

### Acceptance Criteria
- OpenAI API works
- FAQ matching accurate
- Message flow correct
- Error handling robust

### Files Created
- `openai.ts`, `faqMatcher.ts`, `ChatbotContext.tsx`, `useChatbot.ts`

---

## 📝 CHAPTER 7: Chatbot - UI
**Priority:** Medium | **Duration:** 2 iterations

### Tasks
**Floating Button:**
- [ ] Create `FloatingChatButton.tsx`:
  - Position: fixed bottom-right (24px margins)
  - Size: 56px diameter
  - Icon: MessageCircle (Lucide)
  - Color: CFS_Demo brand blue
  - Hover: scale(1.1)
  - Click: toggle widget

**Chat Widget:**
- [ ] Create `ChatWidget.tsx`:
  - Size: 400px × 600px (desktop), full-screen (mobile)
  - Glassmorphic card
  - Slide-up entrance animation
  - Sections: Header, Messages, Input

**Components:**
- [ ] `ChatHeader.tsx`: Title + minimize/close buttons
- [ ] `ChatMessage.tsx`: Bubble design
  - User: right-aligned, blue background
  - Bot: left-aligned, gray background
  - Source badge: "FAQ" or "AI"
  - Copy button
- [ ] `ChatInput.tsx`: Text field + send button
- [ ] `TypingIndicator.tsx`: Animated dots

**Animations:**
- [ ] Widget slide-up entrance
- [ ] Message fade-in with bounce
- [ ] Typing indicator animation

### Acceptance Criteria
- Floating button visible and functional
- Widget opens/closes smoothly
- Messages display correctly
- Typing indicator works
- Mobile responsive

### Files Created
- `FloatingChatButton.tsx`, `ChatWidget.tsx`, `ChatHeader.tsx`, `ChatMessage.tsx`, `ChatInput.tsx`, `TypingIndicator.tsx`

---

## 📝 CHAPTER 8: Testing & Deployment
**Priority:** Medium | **Duration:** 1 iteration

### Tasks
**Testing:**
- [ ] Test all routes navigate correctly
- [ ] Verify Homepage portal selection
- [ ] Test all restyled pages (Dashboard, FAQ, Progress)
- [ ] Test Training Hub features
- [ ] Test Customer Care features
- [ ] Test chatbot: FAQ matching + OpenAI fallback
- [ ] Test responsive design on mobile/tablet
- [ ] Test dark mode (if applicable)
- [ ] Check accessibility (keyboard navigation, screen readers)
- [ ] Verify no console errors

**Build & Deploy:**
- [ ] Run `npm run build` - verify success
- [ ] Test production build locally: `npm run preview`
- [ ] Update `vercel.json` if needed
- [ ] Add environment variable to Vercel: `VITE_OPENAI_API_KEY`
- [ ] Deploy to Vercel
- [ ] Test deployed site

**Documentation:**
- [ ] Update README.md with:
  - New routing structure
  - Environment variables
  - Integration notes
- [ ] Document chatbot setup
- [ ] Add screenshots

### Acceptance Criteria
- All features tested and working
- Build completes without errors
- Deployment successful
- No broken links or console errors
- Documentation updated

---

## 🔧 Technical Notes

### Environment Variables
```bash
VITE_OPENAI_API_KEY=sk-your-key-here
```

### CFS_Demo Dependencies to Add
```json
{
  "dependencies": {
    "canvas-confetti": "^1.9.3",
    "clsx": "^2.1.0",
    "openai": "^4.0.0"
  }
}
```

### Tailwind Config Update
```javascript
colors: {
  brand: {
    DEFAULT: '#0c4a6e',
    accent: '#2d9cdb',
    soft: '#e0f2fe',
    deep: '#082f49'
  }
}
```

### Chatbot System Prompt
```
You are a helpful financial advisor for Colonial First State (CFS) members. 
Provide clear, accurate information about superannuation, investments, and 
retirement planning. Always include a disclaimer that this is general 
information, not personalized financial advice.
```

---

## 📊 Progress Tracking

### Chapter Status
- [ ] Chapter 1: Environment Setup
- [ ] Chapter 2: Homepage & Routing
- [ ] Chapter 3: CFS_Demo Styling
- [ ] Chapter 4: Training Hub Integration
- [ ] Chapter 5: Customer Care Integration
- [ ] Chapter 6: Chatbot Backend
- [ ] Chapter 7: Chatbot UI
- [ ] Chapter 8: Testing & Deployment

### Priority Order
1. **Critical**: Chapters 1, 2 (Foundation)
2. **High**: Chapters 3, 4, 5 (Integration & Styling)
3. **Medium**: Chapters 6, 7, 8 (Chatbot & Polish)

---

## 🎯 Definition of Done

### Project Complete When:
- ✅ Homepage allows Client/Advisor selection
- ✅ All existing pages restyled with CFS_Demo theme
- ✅ Training Hub integrated and functional
- ✅ Customer Care integrated and functional
- ✅ Chatbot provides FAQ + AI responses
- ✅ All routes work correctly
- ✅ Mobile responsive
- ✅ No console errors
- ✅ Deployed to production
- ✅ Documentation updated

---

**END OF PRD**
