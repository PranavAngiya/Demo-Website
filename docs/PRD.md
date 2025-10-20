# Product Requirements Document
## CFS Interactive Member Portal

**Version:** 2.0  
**Last Updated:** October 20, 2025  
**Project Lead:** Windsurf AI  

---

## 📋 Executive Summary

Build a **visually breathtaking, aesthetics-FIRST member portal** for Colonial First State (CFS) that showcases the absolute pinnacle of modern web design. This project is fundamentally about demonstrating **AI vibe-coding excellence** through stunning visuals, fluid animations, and delightful micro-interactions. The portal helps members navigate real CFS information (100+ FAQ questions) through an intelligent, personalized interface and comprehensive Personal Tutor, all while delivering a premium, luxury-brand visual experience.

**PRIMARY FOCUS: Visual Excellence > Functionality**  
Every pixel, transition, animation, and interaction must be polished to perfection.

---

## 🎯 Project Objectives

### PRIMARY OBJECTIVE (Non-Negotiable)
**🎨 Visual & Aesthetic Excellence**
- Create the most beautiful, modern, sleek web interface possible
- Implement smooth, purposeful animations throughout every interaction
- Deliver a premium, luxury-brand visual experience
- Showcase cutting-edge UI/UX design patterns
- Make every micro-interaction feel delightful and polished

### SECONDARY OBJECTIVES
1. Provide intelligent, personalized FAQ system with 100+ real CFS questions
2. Deliver comprehensive micro-lessons through an interactive Personal Tutor
3. Implement advanced features (intent search, wizards, personalization)
4. Deploy production-ready site to Vercel

---

## 🎨 Design System (CRITICAL - This Defines Visual Excellence)

### Color Palette
- **Primary:** `#D81421` (CFS Red) - Use for CTAs, accents, hover states
- **Secondary:** `#FFFFFF` (White) - Primary backgrounds, cards
- **Accent:** `#005847` (Deep Teal) - Secondary CTAs, badges, highlights
- **Gradients:**
  - Hero gradients: `linear-gradient(135deg, #D81421 0%, #005847 100%)`
  - Card overlays: `linear-gradient(180deg, rgba(216,20,33,0.05) 0%, transparent 100%)`
  - Glass effects: `rgba(255, 255, 255, 0.1)` with backdrop-blur
- **Neutrals:** 
  - Gray-50 to Gray-900 scale for text hierarchy
  - Subtle shadows: `0 4px 20px rgba(0,0,0,0.08)`
  - Elevations: Multiple shadow layers for depth

### Typography (Modern & Expressive)
- **Display/Hero:** Inter or Poppins 700-900 weight (64-96px on desktop)
- **Headings:** Inter 600-700 (24-48px) with tight letter-spacing
- **Body:** Inter 400-500 (16-18px) with 1.6 line-height
- **Captions:** Inter 400 (14px) in muted gray
- **Numbers/Data:** Tabular nums, JetBrains Mono for account values
- **Emphasis:** Use font-weight and color shifts over italics

### Visual Design Principles
1. **Glassmorphism & Depth**
   - Frosted glass cards with backdrop-blur
   - Layered shadows for elevation hierarchy
   - Subtle gradient overlays on containers

2. **Fluid Animations**
   - 60fps minimum for all animations
   - Easing: cubic-bezier for organic motion
   - Spring physics for interactive elements
   - Page transitions: smooth fade + slide

3. **Micro-Interactions**
   - Button hover: scale, shadow, color shift
   - Input focus: glow effect, smooth border transition
   - Card hover: lift with shadow increase
   - Success states: confetti, checkmark animations
   - Loading: skeleton screens, pulsing placeholders

4. **Spatial Hierarchy**
   - Generous whitespace (min 32px between sections)
   - Max content width: 1280px with centered layout
   - Grid: 12-column responsive with 24px gutters
   - Z-index system: 10 (content), 50 (modals), 100 (toasts)

5. **Modern Patterns**
   - Bento-box layouts for dashboards
   - Neumorphism accents (subtle, not overdone)
   - Parallax scrolling effects
   - Reveal animations on scroll
   - Gradient text for headings
   - Icon + color combinations for categories

6. **Responsive & Accessible**
   - Mobile-first with touch-friendly targets (min 44px)
   - WCAG 2.1 AA contrast (4.5:1 text, 3:1 UI)
   - Reduced motion support via prefers-reduced-motion
   - Keyboard navigation with visible focus rings

---

## 👤 User Persona

**Name:** Alex Chen  
**Age:** 28  
**Occupation:** Marketing Manager  
**Investment Level:** Intermediate  
**Products:** Superannuation, Managed Funds  
**Goals:** Understand investment options, track progress, learn financial literacy  
**Pain Points:** Financial jargon confusing, unsure where to find specific information

---

## 🏗️ Technical Architecture

### Stack
- **Frontend:** React 18+ with Vite
- **Styling:** TailwindCSS + CSS modules for animations
- **Icons:** Lucide React
- **State Management:** React Context + LocalStorage
- **Routing:** React Router v6
- **Backend:** Node.js (minimal - serves mock data)
- **Deployment:** Vercel

### Project Structure
```
/cfs-portal
├── /public
│   └── /assets
│       ├── /icons
│       └── /images
├── /src
│   ├── /components
│   │   ├── /common
│   │   ├── /faq
│   │   └── /tutor
│   ├── /pages
│   ├── /hooks
│   ├── /context
│   ├── /utils
│   ├── /data
│   │   ├── mockUser.json
│   │   ├── faqData.json
│   │   └── tutorLessons.json
│   ├── /styles
│   └── App.jsx
├── /docs
│   └── feature-document.json
├── package.json
├── vite.config.js
├── tailwind.config.js
└── vercel.json
```

---

## 📦 Feature Breakdown

### Core Features

#### 1. Personalized User Account System
**Visual Priority: Showcase personalization through beautiful, dynamic UI**
- Load mock user data from `mockUser.json` (name, balance, products, goals)
- **Personalized Dashboard:**
  - Animated greeting with user's name
  - Real-time portfolio value counter with smooth number transitions
  - Product cards specific to user's holdings (Super, Managed Funds, etc.)
  - Personalized insights based on account type and balance
  - Goal progress indicators with visual bars/charts
- **Context-Aware Content:**
  - FAQ results filtered/ranked by user's products
  - Tutor lessons recommended based on user profile
  - Personalized quick actions based on recent activity
- **Account Simulation:**
  - Mock transaction history with elegant timeline view
  - Simulated contributions and withdrawals
  - Visual investment breakdown with interactive charts

#### 2. Interactive FAQ System (100+ Real Questions from docs/FAQ.json)
**Visual Priority: Make information discovery delightful and visually engaging**

**Real Data Source:** Uses actual CFS FAQ questions from `docs/FAQ.json`
- **Categories:** Your account, Superannuation, Insurance in super, Retirement, Financial advice, e-Signatures, Employer (Clearing House), Investments, Regulatory (YFYS)
- **100+ Questions** covering comprehensive CFS member needs

**Advanced Features:**
- **Intent Search with Instant Grouping:**
  - Real-time fuzzy search with <200ms response
  - Animated category pills that group results instantly
  - Highlighted search terms in results
  - Search suggestions dropdown with smooth animations
  - Empty state with helpful prompts
  
- **"Explain Simply" Toggle:**
  - Smooth switch animation between technical/simple language
  - Visual indicator (bulb icon or similar) for current mode
  - Content morphs smoothly between versions
  
- **"Show Me Steps" Mode:**
  - Transforms answers into numbered, visual step lists
  - Each step has icon, title, and description
  - Progress indicator for multi-step processes
  - Animated step reveal on mode switch
  
- **Side-by-Side Wizard View:**
  - Split-screen layout (answer left, wizard right)
  - Interactive wizard with step navigation
  - Progress bar showing wizard completion
  - Visual checkmarks as user completes steps
  - Responsive: stacks vertically on mobile
  
- **Copy to Clipboard:**
  - Animated copy button with icon transition
  - Toast notification with success animation
  - Copied text formatted for easy sharing
  
- **Bookmark System:**
  - Star icon with fill animation on bookmark
  - Saved to localStorage with smooth feedback
  - Dedicated "My Bookmarks" page with grid layout
  - Remove bookmarks with swipe gesture on mobile
  
- **"Still Stuck?" Support Checklist:**
  - Modal with generated checklist
  - Includes: question, steps attempted, account context
  - Copy/print/email options
  - Empathetic messaging and helpful resources

#### 3. Personal Tutor (Interactive Learning Experience)
**Visual Priority: Make learning engaging through stunning visuals and interactions**

- **10 Comprehensive Micro-Lessons:**
  1. Understanding Superannuation (The Basics)
  2. Investment Fundamentals (Stocks, Bonds, Funds)
  3. Fees & Costs (What You're Paying)
  4. Risk vs Return (Balancing Your Portfolio)
  5. Diversification (Spreading Your Risk)
  6. Compound Interest (The Magic of Time)
  7. Tax Benefits (Maximizing Deductions)
  8. Rebalancing Strategies (Staying on Track)
  9. ESG Investing (Investing with Values)
  10. Retirement Planning (Your Future Goals)

- **Mixed Lesson Formats with Visual Excellence:**
  - **Text Lessons:** Beautiful typography, callout boxes, visual highlights
  - **Quiz Lessons:** Animated questions, instant feedback, celebration effects
  - **Interactive Diagrams:** Click-to-explore visualizations, tooltips
  - **Calculators:** Real-time calculations with animated result displays
  - **Scenario Lessons:** Decision trees with branching animations

- **Visual Features:**
  - Lesson cards with unique gradient backgrounds per topic
  - Progress ring animation showing overall completion
  - Lesson completion badges with unlock animations
  - Smooth transitions between lesson screens
  - Visual knowledge checks with interactive elements
  - Certificate of completion with confetti animation
  - Session-based progress tracking (not persisted)

#### 4. Dashboard/Home (The Stunning First Impression)
**Visual Priority: Hero section that WOWs immediately**

- **Hero Section:**
  - Full-width gradient background with subtle animation
  - Large, bold personalized greeting ("Welcome back, Alex")
  - Glassmorphic card with user avatar and account summary
  - Animated particles or subtle motion graphics
  
- **Portfolio Overview (Bento-Box Layout):**
  - Animated counter showing total portfolio value
  - Product cards with icons, balances, and mini charts
  - Recent activity timeline with smooth reveal animation
  - Growth indicators with color-coded trends (green up, etc.)
  
- **Quick Actions:**
  - Large, colorful action cards (View FAQ, Start Lesson, etc.)
  - Hover effects: lift, glow, color shift
  - Icon animations on hover
  
- **Featured Content:**
  - Personalized lesson recommendation card
  - Trending FAQ questions carousel
  - Tips and insights specific to user's products
  
- **Visual Polish:**
  - Scroll-triggered animations for each section
  - Parallax effect on background elements
  - Loading skeleton states for data
  - Smooth page transitions from other routes

#### 5. Company Information & Additional Pages
**Visual Priority: Clean, elegant layouts with thoughtful typography**

- **About CFS Page:**
  - Hero section with mission statement
  - Timeline of company milestones with scroll animations
  - Team/values section with card layouts
  - Beautiful imagery and iconography
  
- **Contact Page:**
  - Clean form with micro-interactions
  - Animated map or location visual
  - Contact methods with hover effects
  
- **Resources:**
  - Document library with elegant card grid
  - Downloadable PDFs with icons
  - External links with arrow animations

---

## 📝 Chapter Breakdown

---

### **Chapter 1: Project Setup & Design Foundation**
**Duration:** 1 iteration  
**Scope:** Initialize project with visual-first configuration

**🎨 VISUAL PRIORITY:**
Set up the foundation for beautiful UI with proper tooling, design tokens, and animation libraries.

**Deliverables:**
- Vite + React 18 project initialization
- TailwindCSS with custom CFS design tokens
- Animation libraries: Framer Motion, React Spring
- Icon library: Lucide React
- Project folder structure (organized for scale)
- Custom fonts loaded (Inter/Poppins)
- Global CSS with design variables
- Base layout with stunning header/footer
- Mock user data structure
- Feature document initialization

**Files to Create:**
- `package.json` (with all visual/animation dependencies)
- `vite.config.js`
- `tailwind.config.js` (with custom CFS colors, shadows, animations)
- `src/App.jsx`
- `src/main.jsx`
- `src/components/layout/Header.jsx` (with gradient, glassmorphism)
- `src/components/layout/Footer.jsx` (elegant, minimal)
- `src/components/layout/Layout.jsx`
- `src/data/mockUser.json` (Alex Chen's profile)
- `src/data/mockTransactions.json`
- `src/styles/globals.css` (design tokens, utility classes)
- `src/styles/animations.css` (reusable animation classes)
- `docs/feature-document.json`
- `.env.example`

**Visual Requirements:**
- **Header:** Glassmorphic navbar with CFS logo, gradient underline on hover, smooth shadow on scroll
- **Footer:** Minimal design with social icons that glow on hover
- **Layout:** Max-width container, generous padding, smooth page transitions
- **Typography:** Inter font loaded, proper font-weight scale implemented

**Acceptance Criteria:**
- [ ] `npm run dev` launches with no errors
- [ ] TailwindCSS custom colors working (#D81421, #005847)
- [ ] Framer Motion page transitions working
- [ ] Header has glassmorphic effect and animates on scroll
- [ ] Footer displays with elegant styling
- [ ] Mock user data loads and displays in console
- [ ] Fonts render beautifully with proper weights

**Definition of Done:**
- Visually stunning foundation ready
- All animation libraries configured
- No build errors or warnings

---

### **Chapter 2: Design System & Animation Library**
**Duration:** 1 iteration  
**Scope:** Build gorgeous reusable components with micro-interactions

**🎨 VISUAL PRIORITY:**
Every component must be a work of art with smooth animations and delightful interactions.

**Deliverables:**
- **Button Component:**
  - Multiple variants (primary, secondary, ghost, danger)
  - Hover: scale(1.02), shadow increase, color shift
  - Active: scale(0.98)
  - Loading state with spinner animation
  - Ripple effect on click
  
- **Card Component:**
  - Glassmorphic and solid variants
  - Hover: lift with shadow transition
  - Gradient border option
  - Smooth content reveal animation
  
- **Input/Search Component:**
  - Focus: glow effect with brand color
  - Label floats up on focus
  - Clear button fades in/out
  - Character count with color transition
  
- **Badge/Tag Component:**
  - Color variants per FAQ category
  - Pulse animation option
  - Smooth scale on hover
  
- **Modal/Dialog Component:**
  - Backdrop blur entrance
  - Modal scales and fades in
  - Smooth close animation
  - Keyboard ESC support
  
- **Toast/Notification System:**
  - Slide + fade entrance from top-right
  - Auto-dismiss with progress bar
  - Success/error/info variants with icons
  - Stacking multiple toasts
  
- **Loading States:**
  - Skeleton screens with shimmer effect
  - Spinner with brand colors
  - Progress bars with smooth transitions
  - Pulsing placeholders

- **Animation Utilities:**
  - Fade, slide, scale, rotate helpers
  - Stagger children animations
  - Scroll-triggered reveal animations
  - Custom easing curves

**Files to Create:**
- `src/components/ui/Button.jsx`
- `src/components/ui/Card.jsx`
- `src/components/ui/Input.jsx`
- `src/components/ui/Badge.jsx`
- `src/components/ui/Modal.jsx`
- `src/components/ui/Toast.jsx`
- `src/components/ui/Skeleton.jsx`
- `src/components/ui/Spinner.jsx`
- `src/components/ui/ProgressBar.jsx`
- `src/utils/animations.js`
- `src/hooks/useToast.js`
- `src/hooks/useAnimation.js`
- `src/context/ToastContext.jsx`

**Visual Polish Requirements:**
- All animations 60fps
- Smooth cubic-bezier easing
- Respect prefers-reduced-motion
- Consistent timing (fast: 150ms, medium: 250ms, slow: 400ms)
- Shadow layers for depth
- Color transitions on all hover states

**Acceptance Criteria:**
- [ ] Button hover/click feels premium
- [ ] Cards have beautiful lift effect
- [ ] Input focus state is stunning
- [ ] Modal entrance is smooth and elegant
- [ ] Toasts slide in beautifully
- [ ] Skeleton screens shimmer realistically
- [ ] All components responsive
- [ ] Zero animation jank

**Definition of Done:**
- Component showcase page built
- All micro-interactions polished
- Feature document updated

---

### **Chapter 3: Stunning Dashboard/Home Page**
**Duration:** 1 iteration  
**Scope:** Create the WOW-factor landing experience

**🎨 VISUAL PRIORITY:**
This is the first impression - it MUST be breathtaking. Think Apple-level polish.

**Deliverables:**

1. **Hero Section (Full Viewport):**
   - Animated gradient background (135deg, red to teal, subtle pulse)
   - Large heading: "Welcome back, Alex" (96px, gradient text)
   - Glassmorphic card with user avatar, account summary
   - Floating particle effects (subtle, brand colors)
   - Scroll indicator with bounce animation

2. **Portfolio Overview (Bento-Box Grid):**
   - Total value card: Animated counter from 0 to actual value
   - Product cards (2-3): Each with unique gradient, icon, mini chart
   - Growth indicator: Animated arrow with percentage change
   - Hover effects: Cards lift and glow

3. **Quick Actions Grid:**
   - 4-6 large action cards (FAQ, Tutor, Profile, Support)
   - Each card: Icon, title, description, arrow
   - Stagger animation on page load
   - Hover: Color shift, scale, shadow increase

4. **Recent Activity Timeline:**
   - Elegant vertical timeline design
   - Each item: Date, description, amount, icon
   - Fade-in animation as user scrolls
   - Alternating left/right layout (desktop)

5. **Featured Content Carousel:**
   - Personalized lesson recommendation
   - Trending FAQ topics
   - Auto-rotate with smooth transitions
   - Dots navigation with active state

6. **Insights Panel:**
   - Personalized tips based on user's products
   - Animated reveal on scroll
   - Call-to-action buttons with hover effects

**Files to Create:**
- `src/pages/Dashboard.jsx`
- `src/components/dashboard/HeroSection.jsx`
- `src/components/dashboard/AnimatedCounter.jsx`
- `src/components/dashboard/PortfolioBento.jsx`
- `src/components/dashboard/ProductCard.jsx`
- `src/components/dashboard/QuickActions.jsx`
- `src/components/dashboard/ActivityTimeline.jsx`
- `src/components/dashboard/FeaturedCarousel.jsx`
- `src/components/dashboard/InsightsPanel.jsx`
- `src/components/dashboard/ParticleBackground.jsx`
- `src/context/UserContext.jsx`
- `src/hooks/useUser.js`
- `src/hooks/useCounter.js`

**Visual Requirements:**
- **Hero:** Gradient animation, glassmorphism, particles, scroll indicator
- **Portfolio:** Number counter animation, mini charts (react-chartjs-2 or recharts)
- **Actions:** Stagger animation (delay each card by 100ms)
- **Timeline:** Scroll-triggered fade-in for each item
- **Carousel:** Auto-rotate every 5s, smooth slide transitions
- **Responsive:** Bento grid collapses to single column on mobile

**Acceptance Criteria:**
- [ ] Hero section is visually stunning
- [ ] Portfolio counter animates smoothly from 0
- [ ] All cards have hover effects
- [ ] Timeline reveals on scroll
- [ ] Carousel auto-rotates and responds to clicks
- [ ] Page loads with staggered animations
- [ ] Zero layout shift or jank
- [ ] Mobile experience is equally beautiful

**Definition of Done:**
- Dashboard is production-ready showcase piece
- All animations at 60fps
- Feature document updated

---

### **Chapter 4: FAQ System - Beautiful Core Structure**
**Duration:** 1 iteration  
**Scope:** Build visually stunning FAQ interface with 100+ real questions

**🎨 VISUAL PRIORITY:**
Make information discovery a visual delight with elegant layouts and smooth interactions.

**Data Source:**
- **Use `docs/FAQ.json`** - 100+ real CFS questions already provided
- **Categories:** Your account, Superannuation, Insurance in super, Retirement, Financial advice, e-Signatures, Employer (Clearing House), Investments, Regulatory (YFYS)

**Deliverables:**

1. **FAQ Hero Section:**
   - Gradient background with search-first layout
   - Large heading: "How can we help you today?"
   - Prominent search bar with glass effect
   - Category pills below with icons

2. **Category Navigation:**
   - Horizontal scrolling pill navigation
   - Each category has unique color + icon
   - Active state: filled background, scale(1.05)
   - Smooth underline indicator animation
   - Count badge showing # of questions per category

3. **Question List (Elegant Accordion):**
   - Card-based design with subtle shadows
   - Each question: chevron icon, category badge, question text
   - Hover: slight lift, background color shift
   - Expand animation: height + opacity transition
   - Active question: highlighted with left border accent

4. **Answer Panel:**
   - Markdown-style formatting support
   - Code blocks, lists, bold text rendered beautifully
   - Source citation displayed elegantly
   - Smooth fade-in when expanded
   - Action buttons: Copy, Bookmark, "Still Stuck?"

5. **Visual Enhancements:**
   - Category color coding throughout
   - Empty state with helpful illustration
   - Loading skeleton for questions
   - Scroll-to-top button (appears on scroll)

**Files to Create:**
- `src/pages/FAQ.jsx`
- `src/components/faq/FAQHero.jsx`
- `src/components/faq/CategoryNavigation.jsx`
- `src/components/faq/QuestionAccordion.jsx`
- `src/components/faq/QuestionCard.jsx`
- `src/components/faq/AnswerPanel.jsx`
- `src/components/faq/EmptyState.jsx`
- `src/hooks/useFAQ.js`
- `src/utils/faqHelpers.js`
- `src/utils/categoryColors.js`

**Category Color Mapping:**
```js
{
  "Your account": { color: "#3B82F6", icon: "User" },
  "Superannuation": { color: "#10B981", icon: "PiggyBank" },
  "Insurance in super": { color: "#8B5CF6", icon: "Shield" },
  "Retirement": { color: "#F59E0B", icon: "Sunset" },
  "Financial advice": { color: "#EC4899", icon: "MessageCircle" },
  "Investments": { color: "#D81421", icon: "TrendingUp" },
  // ... etc
}
```

**Visual Requirements:**
- **Accordion:** Max-height transition (400ms ease-in-out)
- **Category Pills:** Transform on active, smooth color transition
- **Cards:** box-shadow elevation, hover lift by 2px
- **Typography:** Question in semibold 18px, answer in regular 16px
- **Spacing:** Generous padding (24px), margins between questions (16px)

**Acceptance Criteria:**
- [ ] FAQ data loads from `docs/FAQ.json`
- [ ] All 100+ questions render correctly
- [ ] Categories filter instantly (<100ms)
- [ ] Accordion expand/collapse is buttery smooth
- [ ] Category colors apply consistently
- [ ] Hover states feel responsive
- [ ] Mobile: categories scroll horizontally
- [ ] Empty state displays when no results

**Definition of Done:**
- FAQ interface is visually polished
- All 100+ questions accessible
- Feature document updated

---

### **Chapter 5: FAQ - Intent Search with Stunning Visuals**
**Duration:** 1 iteration  
**Scope:** Build intelligent search with beautiful animations

**🎨 VISUAL PRIORITY:**
Search must feel magical - instant, smooth, with delightful result animations.

**Deliverables:**

1. **Glassmorphic Search Bar:**
   - Frosted glass effect with subtle backdrop blur
   - Search icon animates on focus (rotate + color change)
   - Input expands slightly on focus (scale 1.02)
   - Clear button fades in when text present
   - Loading indicator inside input (subtle spinner)

2. **Live Search Results:**
   - Results dropdown with smooth slide-down animation
   - Each result card stagger-animates in (50ms delay between)
   - Hover: card lifts, background color shifts
   - Keyboard navigation with visual highlight
   - Category grouping with animated section headers

3. **Search Highlighting:**
   - Matched terms highlighted with brand color background
   - Highlight animates in with fade + scale
   - Multiple matches handled elegantly

4. **Search Suggestions:**
   - Trending searches shown when input empty
   - Recent searches with clock icon
   - Suggestions animate in with stagger
   - Click suggestion fills input with smooth transition

5. **Empty States:**
   - "No results" with helpful illustration/icon
   - Suggested searches based on typo detection
   - Animate in with fade + slight bounce

**Files to Create:**
- `src/components/faq/SearchBar.jsx`
- `src/components/faq/SearchResults.jsx`
- `src/components/faq/SearchResultCard.jsx`
- `src/components/faq/SearchSuggestions.jsx`
- `src/components/faq/SearchHighlight.jsx`
- `src/utils/searchEngine.js`
- `src/utils/intentDetection.js`
- `src/hooks/useSearch.js`
- `src/hooks/useDebounce.js`

**Visual Requirements:**
- **Search Bar:** backdrop-filter: blur(20px), smooth focus ring glow
- **Results:** Max-height transition, overflow-y-auto with custom scrollbar
- **Stagger:** 50ms delay per item using Framer Motion staggerChildren
- **Highlight:** background: rgba(216,20,33,0.15), border-radius: 3px
- **Performance:** Debounce 200ms, virtualize results if >50 items

**Acceptance Criteria:**
- [ ] Search bar looks stunning (glassmorphism perfect)
- [ ] Results appear instantly (<200ms)
- [ ] Stagger animation smooth and delightful
- [ ] Keyboard navigation works flawlessly
- [ ] Highlights are clearly visible but elegant
- [ ] Empty state is helpful and beautiful
- [ ] Mobile: search bar full width, results overlay

**Definition of Done:**
- Search experience is world-class
- 100+ questions search smoothly
- Feature document updated

---

### **Chapter 6: FAQ - Toggles, Modes & Beautiful Utilities**
**Duration:** 1 iteration  
**Scope:** Add stunning interactive features with smooth animations

**🎨 VISUAL PRIORITY:**
Every toggle, button, and mode change must feel responsive and delightful.

**Deliverables:**

1. **"Explain Simply" Toggle:**
   - Beautiful toggle switch (iOS-style)
   - Switch slides with spring physics animation
   - Background color transitions: gray → brand teal
   - Icon changes: Lightbulb (off) → LightbulbOn (on)
   - Answer text morphs smoothly between versions (cross-fade)
   - Tooltip on hover explaining the feature

2. **"Show Me Steps" Mode Button:**
   - Outlined button with icon (ListOrdered)
   - Active state: filled background with white text
   - Click triggers answer reformat animation:
     - Answer fades out (150ms)
     - Content restructures into numbered steps
     - Steps fade in with stagger (50ms per step)
   - Each step has icon, number badge, title, description

3. **Copy to Clipboard Button:**
   - Icon button with Copy icon
   - Hover: scale(1.1) + tooltip "Copy answer"
   - Click animation:
     - Icon morphs to CheckCircle (success)
     - Button background flashes green briefly
     - Toast notification slides in: "Copied to clipboard!"
     - Icon reverts after 2s

4. **Bookmark System:**
   - Star icon button (outline when not bookmarked)
   - Click: Star fills with color + scale bounce animation
   - Saved to localStorage with success toast
   - Bookmarked questions show filled star
   - "My Bookmarks" page:
     - Grid of bookmarked question cards
     - Remove on click with fade-out animation
     - Empty state with illustration

5. **Answer Formatting:**
   - Support for markdown: **bold**, *italic*, lists, links
   - Code blocks with syntax highlighting (if needed)
   - Callout boxes for important notes (colored border)
   - Source citations in muted text at bottom

**Files to Create:**
- `src/components/faq/ExplainSimplyToggle.jsx`
- `src/components/faq/ShowStepsButton.jsx`
- `src/components/faq/StepsList.jsx`
- `src/components/faq/CopyButton.jsx`
- `src/components/faq/BookmarkButton.jsx`
- `src/components/faq/MarkdownRenderer.jsx`
- `src/pages/Bookmarks.jsx`
- `src/hooks/useBookmarks.js`
- `src/hooks/useClipboard.js`
- `src/utils/textFormatter.js`

**Visual Requirements:**
- **Toggle:** Width 48px, height 24px, switch circle 20px, smooth 200ms transition
- **Steps:** Numbered badges (circle with gradient), icons from Lucide
- **Copy:** Morph animation using Framer Motion's layout prop
- **Bookmark:** Spring animation with overshoot for bounce
- **Toast:** Slide from top-right, auto-dismiss after 3s with progress bar

**Acceptance Criteria:**
- [ ] Toggle animation is buttery smooth
- [ ] Answer morphs elegantly between simple/technical
- [ ] Steps mode formats beautifully with icons
- [ ] Copy button gives instant visual feedback
- [ ] Toast notifications feel premium
- [ ] Bookmark star bounce is delightful
- [ ] Bookmarks page is clean and functional
- [ ] localStorage persists across sessions

**Definition of Done:**
- All utilities polished to perfection
- Every interaction feels responsive
- Feature document updated

---

### **Chapter 7: FAQ - Wizard & "Still Stuck" with Polish**
**Duration:** 1 iteration  
**Scope:** Build gorgeous side-by-side wizard and support flow

**🎨 VISUAL PRIORITY:**
Wizards and modals must feel like premium, guided experiences.

**Deliverables:**

1. **Side-by-Side Layout:**
   - Split screen: 60% answer panel, 40% wizard panel
   - Vertical divider with subtle gradient
   - Both panels scroll independently
   - Smooth layout transition when wizard activates
   - Mobile: Tabs (Answer / Wizard) with slide animation

2. **Mini Wizard Component:**
   - Card-based wizard with progress indicator at top
   - Progress: 5-step dot indicator with animated line fill
   - Each step:
     - Icon + number badge
     - Title + description
     - Interactive element (checkbox, input, button)
     - "Next" button (disabled until step complete)
   - Step navigation: slide transition (left/right)
   - Checkmark animation when step completed
   - Final step: Success screen with confetti 🎉

3. **"Still Stuck?" Button:**
   - Positioned at bottom of answer panel
   - Soft, friendly design (not alarming)
   - Icon: HelpCircle or MessageCircle
   - Hover: gentle pulse animation
   - Click: Opens modal with support checklist

4. **Support Checklist Modal:**
   - Large modal (max-width 600px) with backdrop blur
   - Header: "We're here to help" with empathetic copy
   - Checklist includes:
     - Question you were trying to solve
     - Steps you attempted (from wizard if used)
     - Your account type (from mockUser.json)
     - Suggested next actions
   - Actions:
     - Copy to clipboard button
     - Print button (opens print dialog)
     - Email to support (mailto link)
   - Each action has icon + tooltip
   - Close with smooth fade-out

5. **Actionable Questions:**
   - Mark certain questions in FAQ.json as actionable
   - Examples: "How do I change investment options?", "How do I update my details?"
   - These questions automatically show wizard
   - Wizard steps tailored to the specific question

**Files to Create:**
- `src/components/faq/SideBySideLayout.jsx`
- `src/components/faq/MiniWizard.jsx`
- `src/components/faq/WizardStep.jsx`
- `src/components/faq/ProgressIndicator.jsx`
- `src/components/faq/StillStuckButton.jsx`
- `src/components/faq/SupportChecklistModal.jsx`
- `src/components/faq/ConfettiAnimation.jsx`
- `src/utils/generateChecklist.js`
- `src/data/wizardSteps.json`

**Visual Requirements:**
- **Split Layout:** Grid with fr units, smooth transition (300ms)
- **Progress:** Filled dots connected by animated line (width transition)
- **Wizard:** Each step slides in from right, previous slides to left
- **Confetti:** Canvas-based animation, brand colors, 2s duration
- **Modal:** backdrop-filter blur, scale + fade entrance
- **Checklist:** Clean, printable design (CSS @media print)

**Acceptance Criteria:**
- [ ] Side-by-side layout looks professional
- [ ] Wizard steps navigate with smooth slides
- [ ] Progress indicator updates correctly
- [ ] Confetti animation triggers on completion
- [ ] "Still Stuck?" button is friendly and clear
- [ ] Modal opens with beautiful animation
- [ ] Checklist is comprehensive and copyable
- [ ] Print styling is clean (no unnecessary elements)
- [ ] Mobile tabs work smoothly

**Definition of Done:**
- FAQ system feature-complete
- All advanced features polished
- Feature document updated

---

### **Chapter 8: Personal Tutor - Stunning Foundation**
**Duration:** 1 iteration  
**Scope:** Create visually captivating learning hub

**🎨 VISUAL PRIORITY:**
Make learning irresistible with beautiful lesson cards and engaging visuals.

**Deliverables:**

1. **Tutor Landing Page:**
   - Hero section with gradient background
   - Heading: "Master Your Financial Future"
   - Subheading: "10 interactive lessons designed just for you"
   - Progress ring showing overall completion (animated on load)
   - CTA button: "Continue Learning" (pulses if lesson in progress)

2. **Lesson Grid (Bento-Style):**
   - 10 lesson cards in responsive grid (3 cols desktop, 2 tablet, 1 mobile)
   - Each card:
     - Unique gradient background per lesson
     - Large icon (64px) specific to topic
     - Lesson number badge (top-left)
     - Title in bold
     - Brief description (2 lines)
     - Progress indicator (circular mini-ring)
     - Lock icon if not yet accessible (sequential unlock)
     - Hover: lift + glow effect
   - Cards stagger-animate in on page load

3. **Progress Tracking:**
   - Top bar showing overall progress (X/10 lessons completed)
   - Animated progress bar with gradient fill
   - Motivational text: "You're doing great! Keep going!"
   - Session-based (resets on page refresh)

4. **Lesson Navigation:**
   - Click card → Navigate to lesson detail page
   - Smooth page transition
   - Breadcrumb: Home → Tutor → Lesson Name

5. **Lesson Data Structure:**
   ```json
   {
     "id": 1,
     "title": "Understanding Superannuation",
     "description": "Learn the basics of the Australian super system",
     "icon": "PiggyBank",
     "gradient": "from-blue-500 to-cyan-500",
     "type": "text", // or "quiz", "calculator", "interactive"
     "duration": "5 min",
     "content": {...}
   }
   ```

**Files to Create:**
- `src/pages/Tutor.jsx`
- `src/components/tutor/TutorHero.jsx`
- `src/components/tutor/LessonGrid.jsx`
- `src/components/tutor/LessonCard.jsx`
- `src/components/tutor/ProgressRing.jsx`
- `src/components/tutor/OverallProgress.jsx`
- `src/data/tutorLessons.json`
- `src/context/TutorContext.jsx`
- `src/hooks/useTutor.js`

**Lesson Themes (Gradient + Icon):**
1. **Super** - Blue to Cyan + PiggyBank
2. **Investments** - Purple to Pink + TrendingUp
3. **Fees** - Orange to Yellow + DollarSign
4. **Risk** - Red to Orange + AlertTriangle
5. **Diversification** - Green to Teal + Network
6. **Compound Interest** - Indigo to Purple + Rocket
7. **Tax** - Gray to Slate + FileText
8. **Rebalancing** - Teal to Green + RefreshCw
9. **ESG** - Lime to Green + Leaf
10. **Retirement** - Amber to Orange + Sunset

**Visual Requirements:**
- **Cards:** Border-radius 16px, shadow on hover, smooth scale(1.03)
- **Progress Ring:** SVG circle with stroke-dasharray animation
- **Stagger:** 80ms delay between cards
- **Gradients:** CSS gradient backgrounds, subtle animation on hover
- **Icons:** 64px Lucide icons in white or matching gradient

**Acceptance Criteria:**
- [ ] Tutor landing page is visually stunning
- [ ] All 10 lesson cards display with unique gradients
- [ ] Progress ring animates smoothly
- [ ] Card hover effects are smooth
- [ ] Stagger animation on page load delights
- [ ] Navigation to lessons works perfectly
- [ ] Mobile grid responsive (1 column)
- [ ] Icons match lesson themes

**Definition of Done:**
- Tutor hub is beautiful and inviting
- All 10 lessons accessible
- Feature document updated

---

### **Chapter 9: Personal Tutor - Beautiful Lesson Types (Part 1)**
**Duration:** 1 iteration  
**Scope:** Build gorgeous text and quiz lessons with animations

**🎨 VISUAL PRIORITY:**
Lessons must be engaging, visually rich, and fun to interact with.

**Deliverables:**

1. **Lesson Detail Page Layout:**
   - Hero section with lesson gradient + icon
   - Breadcrumb navigation
   - Progress indicator (e.g., "3 of 10 sections")
   - Content area with beautiful typography
   - Bottom navigation (Previous / Next lesson)

2. **Text Lesson Component:**
   - Beautiful typography with hierarchy
   - Section headings with accent underlines
   - Paragraphs with optimal line-height (1.7)
   - Callout boxes:
     - **Key Point:** Blue border, lightbulb icon
     - **Warning:** Orange border, alert icon
     - **Tip:** Green border, star icon
   - Inline highlights for important terms
   - Images/illustrations (use placeholder or icons)
   - Smooth scroll-reveal animations per section

3. **Quiz Lesson Component:**
   - Question card with large, readable text
   - 4 answer options as large buttons/cards
   - Each option:
     - Hover: scale + shadow increase
     - Click: instant feedback animation
     - Correct: Green fill with checkmark icon + confetti burst
     - Incorrect: Red shake animation + X icon
   - Explanation panel slides in after answer
   - "Next Question" button appears after feedback
   - Progress dots at top (filled for completed questions)

4. **Quiz Results Screen:**
   - Large score display with animated counter
   - Visual representation: circular progress or stars
   - Performance message:
     - 90-100%: "Excellent! 🎉" with confetti
     - 70-89%: "Great job! 👏"
     - 50-69%: "Good effort! 💪"
     - <50%: "Keep learning! 📚"
   - List of questions with correct/incorrect badges
   - "Review Lesson" and "Continue" buttons

5. **Lesson Completion Flow:**
   - Final section: Completion card with celebration
   - Badge unlock animation (scales in with bounce)
   - Progress updates in TutorContext
   - "Next Lesson" button with arrow animation

**Lesson Content (5 Lessons):**
1. **Understanding Superannuation (Text)**
   - What is super?
   - How does it work?
   - Key terminology
   - Benefits of super

2. **Investment Fundamentals (Quiz)**
   - Q1: What are shares?
   - Q2: What is a managed fund?
   - Q3: Risk vs return relationship?
   - Q4: What is diversification?
   - Q5: Asset allocation definition?

3. **Fees & Costs (Text)**
   - Types of fees
   - How fees impact returns
   - Fee comparison tips
   - Understanding PDSs

4. **Risk vs Return (Quiz)**
   - Q1: Define risk tolerance
   - Q2: High-risk investments?
   - Q3: Conservative portfolio?
   - Q4: Market volatility?
   - Q5: Risk mitigation strategies?

5. **Diversification (Text)**
   - Why diversify?
   - Asset classes
   - Geographic diversification
   - Rebalancing basics

**Files to Create:**
- `src/pages/LessonDetail.jsx`
- `src/components/tutor/LessonHero.jsx`
- `src/components/tutor/TextLesson.jsx`
- `src/components/tutor/CalloutBox.jsx`
- `src/components/tutor/QuizLesson.jsx`
- `src/components/tutor/QuizQuestion.jsx`
- `src/components/tutor/QuizOption.jsx`
- `src/components/tutor/QuizResults.jsx`
- `src/components/tutor/LessonNavigation.jsx`
- `src/components/tutor/CompletionCard.jsx`
- `src/components/tutor/BadgeUnlock.jsx`

**Visual Requirements:**
- **Text:** Font-size 18px, line-height 1.7, max-width 720px
- **Callouts:** Border-left 4px, padding 20px, border-radius 8px
- **Quiz Options:** Large cards (min-height 80px), hover scale(1.02)
- **Correct:** Green-500 background, checkmark scales in
- **Incorrect:** Red-500 border, shake animation (translateX -10 to 10)
- **Results:** Animated counter, confetti if >90%
- **Badge:** Scales from 0 to 1 with spring physics

**Acceptance Criteria:**
- [ ] Text lessons are beautifully formatted
- [ ] Callout boxes stand out elegantly
- [ ] Quiz options have smooth hover effects
- [ ] Answer feedback is instant and clear
- [ ] Confetti triggers on correct answers
- [ ] Results screen shows detailed breakdown
- [ ] Badge unlock animation is delightful
- [ ] Navigation works seamlessly
- [ ] Mobile: all elements responsive

**Definition of Done:**
- 5 lessons fully implemented with rich content
- All animations polished
- Feature document updated

---

### **Chapter 10: Personal Tutor - Interactive Lessons (Part 2)**
**Duration:** 1 iteration  
**Scope:** Build stunning calculators and interactive experiences

**🎨 VISUAL PRIORITY:**
Interactive elements must feel responsive, with real-time visual feedback.

**Deliverables:**

1. **Calculator Lesson Component:**
   - Clean, card-based layout
   - Input fields with labels and tooltips
   - Sliders with value indicators (bubble above thumb)
   - Live calculation result display:
     - Large, prominent number
     - Animated counter when values change
     - Visual chart (bar/line) showing growth over time
   - "Reset" button to clear inputs
   - Explanation section below calculator

2. **Interactive Diagram Component:**
   - Click-to-explore visualizations
   - Flowchart with clickable nodes
   - Each node:
     - Colored circle/rectangle
     - Icon + label
     - Hover: glow effect
     - Click: expands to show details (modal or panel)
   - Connecting lines animated on reveal
   - Step-through mode with "Next" button

3. **Scenario Lesson Component:**
   - Story-based decision tree
   - Each scenario:
     - Card with situation description
     - 2-3 choice buttons
     - Each choice leads to outcome
   - Choices animate in with stagger
   - Selected choice highlights, others fade
   - Outcome slides in with explanation
   - "Try Again" to explore other paths

4. **Chart Component:**
   - Use Recharts or Chart.js
   - Smooth animations on data change
   - Tooltips on hover
   - Branded colors (CFS red/teal)
   - Responsive (scales on mobile)

**Lesson Content (5 Lessons):**

6. **Compound Interest Calculator (Interactive)**
   - Inputs: Initial amount, monthly contribution, interest rate, years
   - Sliders for each input (smooth, labeled)
   - Output: Final balance with animated counter
   - Chart: Line showing balance growth over time
   - Explanation of compound interest formula

7. **Tax Benefits Explorer (Interactive Diagram)**
   - Flowchart showing contribution types
   - Nodes: Pre-tax, post-tax, government co-contribution
   - Click node → See tax treatment and benefits
   - Visual comparison of tax saved

8. **Rebalancing Decision Tree (Scenario)**
   - Scenario: Your portfolio is 70/30 but target is 60/40
   - Choice 1: Sell growth assets
   - Choice 2: Buy defensive assets
   - Choice 3: Redirect new contributions
   - Each shows outcome + explanation

9. **ESG Investing (Text + Quiz)**
   - Text: What is ESG? E/S/G explained
   - Quiz: 4 questions on ESG principles
   - Visual: Icons for Environment, Social, Governance

10. **Retirement Planning Calculator (Interactive)**
   - Inputs: Current age, retirement age, current balance, goal
   - Output: Required monthly contributions
   - Chart: Projected balance at retirement
   - Different scenarios (optimistic/pessimistic)

5. **Badge System:**
   - Each lesson completion = badge unlock
   - Badge design: Circle with icon + lesson name
   - Unlock animation: Scale + rotate + confetti
   - Collection displayed on Tutor home page
   - All badges collected = "Master" badge with special animation

**Files to Create:**
- `src/components/tutor/CalculatorLesson.jsx`
- `src/components/tutor/CompoundInterestCalc.jsx`
- `src/components/tutor/RetirementCalc.jsx`
- `src/components/tutor/InteractiveDiagram.jsx`
- `src/components/tutor/FlowchartNode.jsx`
- `src/components/tutor/ScenarioLesson.jsx`
- `src/components/tutor/ScenarioChoice.jsx`
- `src/components/tutor/ChartComponent.jsx`
- `src/components/tutor/Badge.jsx`
- `src/components/tutor/BadgeCollection.jsx`
- `src/utils/calculations.js`

**Visual Requirements:**
- **Sliders:** Custom styled, branded colors, smooth drag
- **Calculator:** Large result (48px font), animated counter
- **Charts:** 400px height, responsive, animated entrance
- **Flowchart:** SVG-based, animated connecting lines
- **Scenarios:** Cards with border-radius 12px, shadow
- **Badges:** 80px diameter circles, gradient backgrounds

**Acceptance Criteria:**
- [ ] Compound interest calc accurate and updates live
- [ ] Sliders feel smooth and responsive
- [ ] Charts render beautifully with animations
- [ ] Flowchart nodes interactive and informative
- [ ] Scenario choices branch correctly
- [ ] Retirement calc handles edge cases
- [ ] All 10 lessons complete and polished
- [ ] Badge collection displays beautifully
- [ ] Badge unlock animation is celebratory

**Definition of Done:**
- All 10 lessons fully functional
- Interactive elements polished
- Feature document updated

---

### **Chapter 11: Ultimate Polish - Animations & Micro-interactions**
**Duration:** 1 iteration  
**Scope:** Elevate entire site to premium-level polish

**🎨 VISUAL PRIORITY:**
This chapter transforms good into EXCEPTIONAL. Every pixel must delight.

**Deliverables:**

1. **Page Transition System:**
   - Fade + slide transitions between routes
   - Exit animation: Fade out (200ms)
   - Enter animation: Slide up + fade in (300ms)
   - Breadcrumb trail animates in
   - Loading bar at top during transition

2. **Scroll-Triggered Animations:**
   - Elements animate in as they enter viewport
   - Types:
     - **Cards:** Fade + slide up
     - **Text:** Fade in with slight delay per line
     - **Images:** Scale from 0.9 to 1
     - **Buttons:** Slide in from direction
   - Use Intersection Observer for performance
   - Trigger once (not on every scroll)

3. **Advanced Hover Effects:**
   - **Buttons:**
     - 3D tilt effect on mouse move
     - Gradient shift animation
     - Shadow grows smoothly
   - **Cards:**
     - Lift with shadow increase
     - Subtle gradient rotation
     - Border glow effect
   - **Links:**
     - Underline slides in from left
     - Color transition smooth

4. **Loading State Animations:**
   - **Skeleton Screens:**
     - Shimmer effect (gradient moves left to right)
     - Matches actual content layout
     - Smooth transition to real content
   - **Spinners:**
     - Branded color spinner (CSS-based)
     - Multiple sizes (sm, md, lg)
   - **Progress Bars:**
     - Animated stripe pattern
     - Smooth width transitions

5. **Success/Celebration Animations:**
   - **Confetti:**
     - Canvas-based, brand colors
     - Triggered on: Quiz perfect score, all lessons complete
     - Physics-based fall animation
   - **Checkmarks:**
     - SVG path animation (draw effect)
     - Green circle background scales in
   - **Number Counters:**
     - Smooth count-up animation
     - Easing function for natural feel

6. **Micro-interactions:**
   - **Form Inputs:**
     - Label floats up on focus
     - Border color transitions
     - Success/error shake
   - **Toasts:**
     - Slide in from top-right
     - Progress bar shows auto-dismiss time
     - Swipe to dismiss (mobile)
   - **Modals:**
     - Backdrop blur with fade
     - Modal scales from 0.9 to 1
     - Close button rotates on hover

7. **Easter Eggs & Delighters:**
   - Konami code unlocks special animation
   - Click CFS logo 5x → Surprise animation
   - Hover on specific icons → Playful bounce
   - Progress milestones → Celebration messages

8. **Performance Optimizations:**
   - Use `will-change` sparingly
   - GPU-accelerated properties (transform, opacity)
   - Debounce scroll listeners
   - Lazy load images with blur-up effect
   - Code-split heavy animation libraries

**Files to Create:**
- `src/utils/pageTransitions.js`
- `src/hooks/useScrollAnimation.js`
- `src/hooks/useIntersectionObserver.js`
- `src/components/animations/ConfettiCanvas.jsx`
- `src/components/animations/CheckmarkAnimation.jsx`
- `src/components/animations/NumberCounter.jsx`
- `src/components/animations/ShimmerSkeleton.jsx`
- `src/components/animations/TiltCard.jsx`
- `src/styles/animations.css`
- `src/styles/hover-effects.css`
- `src/utils/easing.js`

**Animation Library:**
- Framer Motion for complex orchestrations
- CSS transitions for simple states
- Canvas API for confetti
- Intersection Observer for scroll

**Visual Requirements:**
- All animations 60fps minimum
- Respect `prefers-reduced-motion` media query
- Timing functions: cubic-bezier(0.4, 0.0, 0.2, 1) for standard
- Spring animations for organic feel
- No animation longer than 500ms (except special events)

**Acceptance Criteria:**
- [ ] Page transitions feel seamless
- [ ] Scroll animations trigger at right viewport position
- [ ] Hover effects are smooth and responsive
- [ ] Skeleton screens match real content layout
- [ ] Confetti animation is performant and joyful
- [ ] Number counters animate naturally
- [ ] All micro-interactions polished
- [ ] No jank or stuttering
- [ ] Reduced motion mode works correctly
- [ ] Performance: No FPS drops below 55

**Definition of Done:**
- Site feels like a premium product
- Every interaction is delightful
- Animations tested on low-end devices
- Feature document updated

---

### **Chapter 12: Responsive Design & Accessibility (Beauty on All Devices)**
**Duration:** 1 iteration  
**Scope:** Ensure stunning mobile experience and full accessibility

**🎨 VISUAL PRIORITY:**
Mobile must be as beautiful as desktop. Accessibility must be elegant, not an afterthought.

**Deliverables:**

1. **Mobile Navigation:**
   - Hamburger menu with animated icon (transforms to X)
   - Slide-in drawer from right with backdrop blur
   - Menu items stagger-animate in
   - Each item: Icon + label, smooth tap feedback
   - Close on outside click or swipe right
   - Smooth open/close with spring physics

2. **Responsive Grid Adjustments:**
   - **Dashboard:** Bento grid → Single column on mobile
   - **FAQ:** Categories scroll horizontally (snap scroll)
   - **Tutor:** Lesson grid 3 cols → 2 cols → 1 col
   - **Modals:** Full-screen on mobile with slide-up animation
   - All touch targets minimum 44px × 44px

3. **Mobile-Specific Features:**
   - Pull-to-refresh on dashboard (optional)
   - Swipe gestures:
     - Swipe FAQ answer to bookmark
     - Swipe toast to dismiss
     - Swipe between lesson sections
   - Bottom sheet for filters/options
   - Sticky headers that hide on scroll down, show on scroll up

4. **Keyboard Navigation:**
   - Tab through all interactive elements
   - Visual focus indicator (ring with brand color)
   - Skip to main content link
   - Escape closes modals
   - Arrow keys navigate through lists/carousels
   - Enter/Space activate buttons

5. **ARIA & Semantic HTML:**
   - Proper heading hierarchy (h1 → h2 → h3)
   - ARIA labels on icon-only buttons
   - ARIA live regions for dynamic content (toasts, search results)
   - Role attributes (navigation, main, complementary)
   - Alt text on all images
   - Form labels properly associated

6. **Color Contrast:**
   - Text on backgrounds: Minimum 4.5:1 ratio
   - UI elements: Minimum 3:1 ratio
   - Test all color combinations
   - Ensure gradients maintain contrast

7. **Reduced Motion Support:**
   - Detect `prefers-reduced-motion: reduce`
   - Disable/simplify animations:
     - Remove transitions on modals
     - Remove parallax effects
     - Instant scrolls instead of smooth
     - Static badges instead of animated
   - Core functionality unchanged

8. **Touch Optimizations:**
   - Larger tap targets on mobile (min 44px)
   - Hover effects become tap feedbacks
   - Prevent accidental taps (debounce)
   - Haptic feedback on important actions (if supported)

**Files to Create:**
- `src/components/layout/MobileMenu.jsx`
- `src/components/layout/MobileNav.jsx`
- `src/components/common/BottomSheet.jsx`
- `src/hooks/useKeyboardNav.js`
- `src/hooks/useSwipeGesture.js`
- `src/hooks/useReducedMotion.js`
- `src/utils/a11y.js`
- `src/styles/responsive.css`
- `src/styles/accessibility.css`

**Breakpoints:**
```css
/* Mobile First */
base: 320px (default styles)
sm: 640px  /* Large phones */
md: 768px  /* Tablets */
lg: 1024px /* Desktop */
xl: 1280px /* Large desktop */
2xl: 1536px /* Extra large */
```

**Visual Requirements:**
- **Mobile Menu:** 320px width, backdrop-filter blur(10px)
- **Focus Ring:** 2px solid brand teal, offset 2px, border-radius matches element
- **Swipe:** Threshold 50px, velocity-based momentum
- **Bottom Sheet:** Rounded top corners (16px), drag handle indicator

**Acceptance Criteria:**
- [ ] Mobile navigation is smooth and beautiful
- [ ] All layouts responsive (tested 320px to 2560px)
- [ ] Hamburger animation smooth
- [ ] Touch targets all > 44px
- [ ] Keyboard navigation works flawlessly
- [ ] Focus indicators clearly visible
- [ ] WAVE scan: 0 errors
- [ ] axe DevTools: 0 violations
- [ ] Color contrast: All AA compliant
- [ ] Screen reader (NVDA/JAWS): All content accessible
- [ ] Reduced motion mode: No jarring movements
- [ ] iOS Safari: No visual bugs
- [ ] Android Chrome: No visual bugs

**Definition of Done:**
- WCAG 2.1 AA compliant
- Mobile experience is stunning
- All devices tested
- Feature document updated

---

### **Chapter 13: Final Polish, Performance & Documentation**
**Duration:** 1 iteration  
**Scope:** Production-ready optimization and comprehensive docs

**🎨 VISUAL PRIORITY:**
Even error states must be beautiful. Performance must not compromise visual quality.

**Deliverables:**

1. **Error Boundary:**
   - Catches React errors gracefully
   - Beautiful error screen:
     - Friendly illustration (broken robot icon)
     - Heading: "Oops! Something went wrong"
     - Explanation in simple language
     - "Go Home" and "Reload" buttons
     - Error details in collapsible section (dev mode)
   - Animated entrance (fade in)

2. **404 Not Found Page:**
   - Full-page design with gradient background
   - Large "404" with gradient text
   - Playful copy: "This page took a vacation"
   - Animated illustration (lost person with map)
   - Search bar to find what they're looking for
   - Quick links to main pages
   - Back button with arrow animation

3. **Performance Optimizations:**
   - **Code Splitting:**
     - Lazy load routes (React.lazy)
     - Lazy load heavy components (charts, confetti)
     - Split vendor bundles
   - **Image Optimization:**
     - WebP format with JPEG fallback
     - Lazy loading with Intersection Observer
     - Blur-up placeholder effect
     - Srcset for responsive images
   - **Bundle Analysis:**
     - Run webpack-bundle-analyzer
     - Remove unused dependencies
     - Tree-shake unused code
     - Target bundle: <300kb initial, <500kb total
   - **Caching:**
     - Service worker for offline support (optional)
     - Cache static assets
     - LocalStorage for user preferences

4. **Bug Fixes:**
   - Test all user flows end-to-end
   - Fix any console errors/warnings
   - Handle edge cases:
     - Empty states
     - Very long names/text
     - Slow network
     - No JavaScript scenario
   - Test localStorage limits
   - Validate form inputs

5. **Documentation:**
   - **README.md:**
     - Project overview with screenshot
     - Features list
     - Tech stack
     - Installation instructions
     - Development commands
     - Build process
     - Deployment steps
     - Contributing guidelines
   - **DEPLOYMENT.md:**
     - Step-by-step Vercel deployment
     - Environment variables
     - Build settings
     - Troubleshooting
   - **Feature Document:**
     - Complete all entries
     - Include screenshots
     - Document all components
   - **Code Comments:**
     - Add JSDoc comments to key functions
     - Explain complex logic
     - Document prop types

6. **Testing:**
   - **Manual Testing:**
     - All features on Chrome, Firefox, Safari, Edge
     - Mobile: iOS Safari, Android Chrome
     - Tablet: iPad Safari
   - **Performance Testing:**
     - Lighthouse audits (target >90 all categories)
     - WebPageTest speed analysis
     - Test on slow 3G
   - **Accessibility Testing:**
     - WAVE scanner
     - axe DevTools
     - Keyboard-only navigation
     - Screen reader (NVDA/VoiceOver)

**Files to Create:**
- `src/components/common/ErrorBoundary.jsx`
- `src/pages/NotFound.jsx`
- `src/pages/ErrorPage.jsx`
- `README.md`
- `docs/DEPLOYMENT.md`
- `docs/DEVELOPMENT.md`
- `.env.example`
- `lighthouse-report.html`

**Visual Requirements:**
- **Error Page:** Gradient background, centered content, friendly tone
- **404 Page:** Playful, not alarming, brand-consistent
- **Loading:** Skeleton screens during lazy loading

**Acceptance Criteria:**
- [ ] Error boundary catches all errors gracefully
- [ ] 404 page is engaging and helpful
- [ ] Lighthouse Performance: >90
- [ ] Lighthouse Accessibility: 100
- [ ] Lighthouse Best Practices: >95
- [ ] Lighthouse SEO: >90
- [ ] Bundle size: Initial <300kb, Total <500kb
- [ ] No console errors or warnings
- [ ] LocalStorage functions correctly
- [ ] All browsers: No visual bugs
- [ ] All features: Tested end-to-end
- [ ] Documentation: Complete and clear

**Definition of Done:**
- Production-ready, optimized application
- All documentation finalized
- Feature document complete with screenshots
- Ready for deployment

---

### **Chapter 14: Vercel Deployment & Launch**
**Duration:** 1 iteration  
**Scope:** Deploy to production and celebrate! 🚀

**🎨 VISUAL PRIORITY:**
Ensure production site maintains visual perfection across all environments.

**Deliverables:**

1. **Pre-Deployment Checklist:**
   - [ ] All features complete and tested
   - [ ] No console errors or warnings
   - [ ] Lighthouse scores >90
   - [ ] All images optimized
   - [ ] Environment variables documented
   - [ ] README complete
   - [ ] Git repository clean (no secrets)

2. **Vercel Configuration:**
   - **vercel.json:**
     ```json
     {
       "buildCommand": "npm run build",
       "outputDirectory": "dist",
       "framework": "vite",
       "rewrites": [
         { "source": "/(.*)", "destination": "/index.html" }
       ],
       "headers": [
         {
           "source": "/assets/(.*)",
           "headers": [
             { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
           ]
         }
       ]
     }
     ```
   - Environment variables (if any)
   - Build settings optimized

3. **Deployment Steps:**
   1. **Connect Repository:**
      - Link GitHub repo to Vercel
      - Auto-deploy on push to main
   2. **Configure Project:**
      - Framework preset: Vite
      - Build command: `npm run build`
      - Output directory: `dist`
   3. **Set Environment Variables:**
      - Add any required env vars
      - Verify in Vercel dashboard
   4. **Deploy:**
      - Trigger initial deployment
      - Watch build logs for errors
   5. **Custom Domain (Optional):**
      - Add custom domain
      - Configure DNS
      - Enable HTTPS (automatic)
   6. **Preview Deployments:**
      - Every PR gets preview URL
      - Test before merging

4. **Post-Deployment Testing:**
   - **Functionality:**
     - [ ] All pages load correctly
     - [ ] All routes work (no 404s)
     - [ ] FAQ search functional
     - [ ] Tutor lessons accessible
     - [ ] LocalStorage works
     - [ ] Bookmarks persist
   - **Performance:**
     - [ ] Run Lighthouse on production URL
     - [ ] Test on slow connection
     - [ ] Check asset loading times
   - **Visual:**
     - [ ] Fonts load correctly
     - [ ] Images display properly
     - [ ] Animations smooth
     - [ ] No layout shifts
   - **Cross-Browser:**
     - [ ] Chrome, Firefox, Safari, Edge
     - [ ] Mobile browsers

5. **Monitoring Setup:**
   - Vercel Analytics (built-in)
   - Error tracking (optional: Sentry)
   - Performance monitoring
   - User feedback mechanism

6. **Launch Checklist:**
   - [ ] Production URL accessible
   - [ ] All features tested on production
   - [ ] Performance acceptable
   - [ ] No production errors
   - [ ] Documentation updated with live URL
   - [ ] Share with stakeholders

**Files to Create/Update:**
- `vercel.json`
- `.env.example`
- `docs/DEPLOYMENT.md` (comprehensive guide)
- `README.md` (add live URL)
- `package.json` (verify scripts)

**Deployment Guide Contents:**
1. Prerequisites
2. Vercel account setup
3. Repository connection
4. Configuration steps
5. Build settings
6. Environment variables
7. Custom domain setup
8. Continuous deployment
9. Rollback procedures
10. Troubleshooting common issues

**Acceptance Criteria:**
- [ ] Site successfully deployed to Vercel
- [ ] Production URL accessible worldwide
- [ ] All routes working (SPA routing configured)
- [ ] Assets loading from CDN
- [ ] HTTPS enabled
- [ ] Performance on production matches local
- [ ] No production-specific errors
- [ ] Lighthouse scores maintained
- [ ] Cross-browser tested on production
- [ ] Mobile tested on production
- [ ] Deployment guide complete and tested

**Definition of Done:**
- ✅ Live, production-ready site
- ✅ Beautiful, fast, accessible
- ✅ All features functional
- ✅ Documentation complete
- ✅ **PROJECT DELIVERED! 🎉**

---

## 📊 Success Metrics

### PRIMARY METRIC: Visual Excellence ⭐
**The site must be visually stunning - this is the #1 priority**
- [ ] Every page is aesthetically beautiful
- [ ] All animations are smooth (60fps minimum)
- [ ] Micro-interactions feel delightful
- [ ] Design feels modern, sleek, and premium
- [ ] Color palette used consistently and effectively
- [ ] Typography creates clear visual hierarchy
- [ ] Glassmorphism, gradients, and shadows used tastefully
- [ ] "Wow factor" on first impression

### User Experience
- [ ] Clean, modern aesthetic that showcases CFS brand
- [ ] Smooth, buttery interactions across all devices
- [ ] Intuitive navigation requiring zero learning curve
- [ ] Personalization feels natural and helpful
- [ ] Every click/tap feels responsive
- [ ] No jarring movements or sudden changes
- [ ] Mobile experience equals desktop quality

### Technical Performance
- [ ] Lighthouse Performance: >90
- [ ] Lighthouse Accessibility: 100
- [ ] Lighthouse Best Practices: >95
- [ ] Lighthouse SEO: >90
- [ ] Bundle size: Initial <300kb, Total <500kb
- [ ] First Contentful Paint: <1.5s
- [ ] Time to Interactive: <3.5s
- [ ] Zero console errors in production
- [ ] WCAG 2.1 AA compliance: 100%

### Functional Completeness
- [ ] All 100+ FAQ questions accessible and searchable
- [ ] Intent search with instant grouping working
- [ ] "Explain Simply" toggle morphs content smoothly
- [ ] "Show Me Steps" mode formats beautifully
- [ ] Copy to clipboard with visual feedback
- [ ] Bookmark system persisting to localStorage
- [ ] "Still Stuck?" generates helpful checklist
- [ ] Side-by-side wizard guides users
- [ ] All 10 tutor lessons complete and polished
- [ ] Mixed lesson formats (text, quiz, calculator, interactive)
- [ ] Badge system with unlock animations
- [ ] Progress tracking (session-based)
- [ ] Personalization based on mock user data
- [ ] Dashboard displays portfolio with animations

### Cross-Browser & Device
- [ ] Chrome (Windows, Mac, Android)
- [ ] Firefox (Windows, Mac)
- [ ] Safari (Mac, iOS)
- [ ] Edge (Windows)
- [ ] Mobile: iOS Safari, Android Chrome
- [ ] Tablet: iPad Safari
- [ ] Tested on 320px to 2560px widths

---

## 🚀 Post-Launch Enhancements (Future)

**Phase 2: Backend & Persistence**
- Real backend API integration (Node.js + Express)
- User authentication system (OAuth, JWT)
- Persistent progress tracking (database)
- User profile management
- Real transaction history

**Phase 3: Advanced Features**
- AI-powered FAQ chatbot (ChatGPT integration)
- Voice search and voice answers
- Multi-language support (i18n)
- Dark mode with smooth theme switching
- Advanced analytics dashboard
- Social sharing features

**Phase 4: Expansion**
- Mobile app (React Native)
- Progressive Web App (PWA) with offline support
- Push notifications
- Email notifications
- Document upload and management
- Live chat with support

---

## 📄 Appendix

### Commit Message Template Format
```
[Chapter X] Brief description

- Bullet point of key changes
- Another change
- Another change
```

### Feature Document Schema
```json
{
  "featureId": "string",
  "title": "string",
  "description": "string",
  "components": [
    {
      "name": "string",
      "path": "string"
    }
  ],
  "stateManagement": "string",
  "dataFlow": "string",
  "visualAssets": ["string"],
  "acceptanceCriteria": ["string"],
  "tests": ["string"],
  "version": "string",
  "lastModified": "ISO date string"
}
```

---

## 🎯 Final Summary

### What Makes This PRD Different

This PRD is fundamentally **VISUAL-FIRST**. Unlike typical product documents that treat design as an afterthought, this PRD places aesthetic excellence at the absolute center of every decision.

**Core Philosophy:**
> "Build something so beautiful that it showcases the pinnacle of what AI vibe-coding can achieve."

### Key Differentiators

1. **Visual Excellence is Primary**
   - Every chapter prioritizes stunning visuals
   - Animations and micro-interactions are mandatory, not optional
   - Each component must delight users

2. **Real CFS Data**
   - 100+ actual FAQ questions from `docs/FAQ.json`
   - Authentic categories and content
   - Personalization features tailored to real use cases

3. **Comprehensive Feature Set**
   - Intent search with instant grouping
   - "Explain Simply" toggle
   - "Show Me Steps" mode
   - Side-by-side wizard
   - Copy/bookmark functionality
   - "Still Stuck?" support flow
   - 10 diverse tutor lessons
   - Mixed lesson formats
   - Full personalization

4. **Modern Tech Stack**
   - React 18 + Vite
   - TailwindCSS for styling
   - Framer Motion for animations
   - Lucide React for icons
   - Chart.js/Recharts for visualizations
   - Vercel for deployment

### Success Criteria Recap

✅ **Visual**: Every page is aesthetically stunning  
✅ **Functional**: All features work flawlessly  
✅ **Performant**: Lighthouse scores >90  
✅ **Accessible**: WCAG 2.1 AA compliant  
✅ **Responsive**: Beautiful on all devices  

### Development Approach

- **Iterative**: One chapter per prompt
- **Quality-First**: Never skip visual polish
- **User-Centric**: Every feature serves the member
- **Documentation**: Maintain feature document throughout
- **Testing**: Continuous validation at each stage

### The Promise

By following this PRD chapter-by-chapter, we will deliver a **production-ready, visually breathtaking web application** that demonstrates the absolute best of AI-powered vibe-coding. This won't just be a functional website—it will be a portfolio-worthy showcase of modern web design excellence.

**Let's build something extraordinary.** 🚀

---

**End of PRD**
